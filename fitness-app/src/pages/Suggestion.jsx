import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Suggestions() {
  const [suggestion, setSuggestion] = useState("");
  const [preference, setPreference] = useState("veg");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const token = localStorage.getItem("token");

  const getSuggestion = async () => {
    setLoading(true);
    setSuggestion(""); // Clear previous suggestion
    try {
      // fetch daily calories first
      const res = await api.get("/users/calorie-goal");
      const dailyCalories = res.data.dailyCalories;

      // Use fetch for streaming response
      const response = await fetch(`${api.defaults.baseURL}/ai/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ dailyCalories, preference, customPrompt }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          alert(errorData.error);
        } else {
          alert("Failed to get AI suggestion. Please try again.");
        }
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedSuggestion = "";
      let isDone = false;

      while (!isDone) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data !== '') {
              accumulatedSuggestion += data;
              setSuggestion(accumulatedSuggestion);
            }
          } else if (line.startsWith('event: done')) {
            // Suggestion complete
            fetchHistory();
            isDone = true;   // stop loop
            break;
          } else if (line.startsWith('event: error')) {
            const errorData = JSON.parse(line.slice(13));
            alert(`Error: ${errorData.error}`);
            isDone = true;   // stop loop
            break;
          }
        }
      }

      reader.cancel(); // ensure reader is closed
    } catch (error) {
      console.error("Error getting suggestion:", error);
      alert("Failed to get AI suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    const res = await api.get("/ai/history");
    setHistory(res.data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mt-20">AI Suggestions</h2>

      <div className="bg-white p-4 rounded-lg shadow-sm border mt-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center text-black">
              <input
                type="radio"
                value="veg"
                checked={preference === "veg"}
                onChange={() => setPreference("veg")}
                className="mr-2"
              />
              <span className="text-sm">Vegetarian</span>
            </label>
            <label className="flex items-center text-black">
              <input
                type="radio"
                value="non-veg"
                checked={preference === "non-veg"}
                onChange={() => setPreference("non-veg")}
                className="mr-2"
              />
              <span className="text-sm">Non-Vegetarian</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter your custom prompt (optional)"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="border p-3 w-full rounded text-sm"
          />
        </div>

        <button
          className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700 transition-colors disabled:bg-gray-400 text-sm w-full sm:w-auto"
          onClick={getSuggestion}
          disabled={loading}
        >
          {loading ? "Getting Suggestion..." : "Get New Suggestion"}
        </button>
      </div>

      {loading && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-700">Generating AI food suggestion...</p>
        </div>
      )}

      {suggestion && (
        <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4">
            <h3 className="text-white text-lg font-bold flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              AI Food Suggestion
            </h3>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-gray-800 whitespace-pre-line leading-relaxed text-sm prose prose-green">{suggestion}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => navigator.clipboard.writeText(suggestion)}
                className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-bold mb-4">Suggestion History</h3>
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No suggestions yet.</p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item._id} className="bg-white border rounded-lg shadow-sm p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.preference === 'veg' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {item.preference.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">{item.dailyCalories} kcal</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="whitespace-pre-line text-sm text-gray-800 leading-relaxed">{item.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
