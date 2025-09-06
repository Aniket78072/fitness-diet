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
    try {
      // fetch daily calories first
      const res = await api.get("/users/calorie-goal");

      const dailyCalories = res.data.dailyCalories;

      // request new AI suggestion
      const aiRes = await api.post("/ai/suggest", { dailyCalories, preference, customPrompt });

      setSuggestion(aiRes.data.suggestion);
      fetchHistory(); // refresh history
    } catch (error) {
      console.error("Error getting suggestion:", error);
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
    <div className="p-6 ">
      <h2 className="text-xl mt-20">AI Suggestions</h2>

      <div className="flex gap-2 my-2">
        <label>
          <input type="radio" value="veg" checked={preference === "veg"} onChange={() => setPreference("veg")} />
          Veg
        </label>
        <label>
          <input type="radio" value="non-veg" checked={preference === "non-veg"} onChange={() => setPreference("non-veg")} />
          Non-Veg
        </label>
      </div>

      <div className="my-2">
        <input
          type="text"
          placeholder="Enter your custom prompt"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      <button
        className="bg-green-600 text-white p-2 disabled:bg-gray-400"
        onClick={getSuggestion}
        disabled={loading}
      >
        {loading ? "Getting Suggestion..." : "Get New Suggestion"}
      </button>

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

      <h3 className="mt-6 font-bold">History</h3>
      <ul className="mt-2 space-y-2">
        {history.map((item) => (
          <li key={item._id} className="border p-2 rounded">
            <p><strong>{item.preference.toUpperCase()}</strong> ({item.dailyCalories} kcal)</p>
            <p className="whitespace-pre-line text-sm">{item.suggestion}</p>
            <p className="text-xs text-gray-500">Created: {new Date(item.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
