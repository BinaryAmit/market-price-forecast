"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Point = { date: string; price: number; market?: string };

interface Props {
  historical: Point[];
  forecast: Point[];
  crop: string;
}

export default function PriceChart({ historical, forecast, crop }: Props) {
  // Combine historical and forecast data into a single array
  const data = [
    ...historical.map((d) => ({ ...d, type: "Historical" })),
    ...forecast.map((d) => ({ ...d, type: "Forecast", date: d.date })), // Preserve forecast labels
  ];

  // Format date for better readability
  const formatDate = (date: string) => {
    if (date.startsWith("Day+")) return date;
    const [day, month, year] = date.split("/");
    return `${day}/${month}`; // Truncate to DD/MM for historical data
  };

  // Custom tooltip to mimic the second screenshot
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-2 rounded shadow-lg">
          <p className="text-gray-800">{`Date: ${label}`}</p>
          <p className="text-gray-800">{`Price: ₹${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
        <h2 className="text-xl font-bold">📈 {crop} Price Trend</h2>
        <p className="text-sm opacity-90">Continuous trend (historical + predicted)</p>
      </div>
      <div className="p-6">
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                label={{ value: "Price (₹/Quintal)", angle: -90, position: "insideLeft", fill: "#6b7280" }}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
