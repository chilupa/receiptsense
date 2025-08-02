"use client";

import { useState } from "react";

interface PriceStats {
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

interface StoreComparison {
  store: string;
  avgPrice: number;
  count: number;
}

interface Recommendation {
  type: string;
  message: string;
  savings?: number;
}

interface ComparisonResponse {
  itemName: string;
  totalItems: number;
  priceStats: PriceStats;
  storeComparison: StoreComparison[];
  recommendations: Recommendation[];
}

export default function PriceComparison() {
  const [itemName, setItemName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResponse | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!itemName.trim()) {
      setError("Please enter an item name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/price-comparison/${encodeURIComponent(itemName)}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      if (data.message) {
        setError(data.message);
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Failed to search for item. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Price Comparison</h2>

      <div className="space-y-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name (e.g., milk, bread, apples)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Price Analysis for {result.itemName}
              </h3>
              <p className="text-blue-700">
                Found {result.totalItems} similar items in database
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                <div className="text-2xl font-bold text-green-800">
                  ${result.priceStats.minPrice.toFixed(2)}
                </div>
                <div className="text-green-600">Lowest Price</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
                <div className="text-2xl font-bold text-blue-800">
                  ${result.priceStats.avgPrice.toFixed(2)}
                </div>
                <div className="text-blue-600">Average Price</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                <div className="text-2xl font-bold text-red-800">
                  ${result.priceStats.maxPrice.toFixed(2)}
                </div>
                <div className="text-red-600">Highest Price</div>
              </div>
            </div>

            {result.storeComparison.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <h4 className="text-lg font-semibold mb-4">Store Comparison</h4>
                <div className="space-y-2">
                  {result.storeComparison
                    .sort((a, b) => a.avgPrice - b.avgPrice)
                    .map((store, index) => (
                      <div
                        key={store.store}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center">
                          <span
                            className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center mr-3 ${
                              index === 0
                                ? "bg-green-500"
                                : index === 1
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-medium">{store.store}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            ${store.avgPrice.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {store.count} items
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <h4 className="text-lg font-semibold text-purple-800 mb-4">
                  💡 Recommendations
                </h4>
                <div className="space-y-3">
                  {result.recommendations.map((rec, index) => {
                    const isGoodDeal = rec.type === 'best_deal' || rec.type === 'good_deal' || rec.type === 'store_recommendation';
                    const isBadDeal = rec.type === 'overpaid';
                    
                    return (
                      <div key={index} className={`p-3 border rounded-md ${
                        isGoodDeal ? 'bg-green-50 border-green-300' :
                        isBadDeal ? 'bg-red-50 border-red-300' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <p className={`font-medium ${
                          isGoodDeal ? 'text-green-800' :
                          isBadDeal ? 'text-red-800' :
                          'text-blue-800'
                        }`}>
                          {isGoodDeal && '💰 '}
                          {isBadDeal && '⚠️ '}
                          {!isGoodDeal && !isBadDeal && '💡 '}
                          {rec.message}
                        </p>
                        {rec.savings && (
                          <p className={`text-sm mt-1 font-semibold ${
                            isGoodDeal ? 'text-green-700' :
                            isBadDeal ? 'text-red-700' :
                            'text-blue-600'
                          }`}>
                            {isGoodDeal ? 'Save: ' : isBadDeal ? 'Overpaid: ' : 'Potential savings: '}
                            ${rec.savings.toFixed(2)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
