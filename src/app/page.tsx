"use client";

import { useState, useEffect } from "react";
import PriceChart from "../components/PriceChart";

type ForecastData = {
  historical: { date: string; price: number; market?: string }[];
  forecast: { date: string; price: number }[];
};

const CROPS_LIST = [
  "Rice", "Wheat", "Maize", "Millet", "Sorghum", "Pearl Millet", "Barley",
  "Lentils", "Chickpeas", "Pigeon Pea", "Black Gram", "Green Gram",
  "Groundnut", "Mustard", "Sesame", "Sunflower", "Soybean",
  "Sugarcane", "Cotton", "Jute", "Tobacco",
  "Tomato", "Potato", "Onion", "Cauliflower", "Cabbage", "Pea", "Bean", "Brinjal", "Okra", "Spinach",
  "Carrot", "Radish", "Cucumber", "Bottle Gourd", "Ridge Gourd", "Snake Gourd", "Bitter Gourd",
  "Tea", "Coffee", "Turmeric", "Ginger", "Garlic", "Chilli", "Betel Leaf", "Arecanut", "Cashew",
  "Cardamom", "Pepper", "Rubber", "Coconut", "Apple", "Mango", "Banana", "Orange", "Grapes",
  "Guava", "Papaya", "Pomegranate", "Pineapple", "Lemon", "Lime", "Watermelon", "Muskmelon"
];

export default function Home() {
  const [crop, setCrop] = useState("");
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (crop.length > 0) {
      const filtered = CROPS_LIST.filter(
        (item) => item.toLowerCase().includes(crop.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [crop]);

  const handleSuggestionClick = (suggestion: string) => {
    setCrop(suggestion);
    setShowSuggestions(false);
    getForecast();
  };

  const getForecast = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/forecast?crop=${encodeURIComponent(crop)}`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch data";
      setError(`No data found for "${crop}". Try a different crop from suggestions or check spelling.`);
    }
    setLoading(false);
  };

  // Suggestion logic: compare last historical vs first forecast
  const getSuggestion = () => {
    if (!data) return null;
    const lastPrice = data.historical[data.historical.length - 1]?.price;
    const nextPrice = data.forecast[0]?.price;
    if (!lastPrice || !nextPrice) return null;

    const percentageChange = ((nextPrice - lastPrice) / lastPrice) * 100;
    if (nextPrice > lastPrice)
      return `💰 Hold your crop, price may rise by ${percentageChange.toFixed(1)}%!`;
    if (nextPrice < lastPrice)
      return `📉 Better to sell soon, price may drop by ${Math.abs(percentageChange).toFixed(1)}%.`;
    return "ℹ️ Prices look stable.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">🌾 Farmer Price Helper</h1>
          <p className="text-lg text-gray-600">Smart forecasts to help you decide the best time to sell your crops</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-center mb-6 text-green-700">📊 Check Crop Price Forecast</h2>

          <div className="relative mb-4">
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              className="w-full p-4 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 text-lg placeholder-gray-500"
              placeholder="Search for any crop (e.g., Onion, Tomato, Rice...)"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center"
                  >
                    <span className="text-green-600 mr-2">🌱</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={getForecast}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 focus:outline-none focus:ring-4 focus:ring-green-200 transition duration-200"
          >
            {loading ? "🔄 Loading Forecast..." : "🔍 Show Forecast"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded mb-6">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Suggestion */}
        {data && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-xl font-bold text-blue-800">{getSuggestion()}</p>
          </div>
        )}

        {/* Chart */}
        {data && !error && (
          <PriceChart historical={data.historical} forecast={data.forecast} crop={crop} />
        )}
      </div>
    </div>
  );
}
