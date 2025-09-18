/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const crop = searchParams.get("crop") || "Onion";

  try {
    const API_KEY = process.env.DATA_GOV_KEY;
    if (!API_KEY) {
      throw new Error("API key not configured");
    }
    const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"; // daily mandi prices

    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&filters[commodity]=${encodeURIComponent(crop)}&limit=60`; // Increased limit for more data

    const response = await fetch(url);
    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
    const json = await response.json();

    if (!json.records || json.records.length === 0) {
      throw new Error(`No data available for "${crop}". Try another crop.`);
    }

    const historical = json.records
      .filter((r: any) => r.modal_price && !isNaN(parseFloat(r.modal_price)))
      .map((r: any) => ({
        date: r.arrival_date,
        price: parseFloat(r.modal_price),
        market: r.market,
      }))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter((item: { date: string; price: number; market: string }, index: number, self: { date: string; price: number; market: string }[]) =>
        index === self.findIndex((t) => t.date === item.date) // Remove duplicates
      );

    if (historical.length === 0) {
      throw new Error(`No valid price data for "${crop}".`);
    }

    // Weighted moving average forecast with trend
    const lastPrices = historical.slice(-7).map((p: any) => p.price);
    const weights = [0.1, 0.1, 0.15, 0.15, 0.2, 0.15, 0.15];
    const weightedAvg = lastPrices.reduce((sum: number, price: number, i: number) =>
      sum + (price * (weights[i] || 0.1)), 0
    ) / weights.reduce((a, b) => a + b, 0);

    // Simple trend based on last 3 points
    const recent = lastPrices.slice(-3);
    const n = recent.length;
    const sumX: number = recent.reduce((sum: number, _: number, i: number) => sum + i, 0);
    const sumY: number = recent.reduce((sum: number, y: number) => sum + y, 0);
    const sumXY = recent.reduce((sum: number, y: number, i: number) => sum + (i * y), 0);
    const sumX2: number = recent.reduce((sum: number, _: number, i: number) => sum + (i * i), 0);
    const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
    const trendFactor = slope > 0 ? 1.01 : slope < 0 ? 0.99 : 1.0;

    const forecast = Array.from({ length: 7 }, (_, i) => ({
      date: `Day+${i + 1}`,
      price: Math.max(0, Math.round(weightedAvg * Math.pow(trendFactor, i + 1))),
    }));

    return NextResponse.json({ crop, historical, forecast });
  } catch (err) {
    console.error(err);
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch forecast";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
