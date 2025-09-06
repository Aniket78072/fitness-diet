import React, { useState } from "react";
import api from "../api/axios";

export default function AiSuggestions() {
  const [preference, setPreference] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const getSuggestions = async () => {
    try {
      const res = await api.post("/ai/suggest", { preference });
      setSuggestions(res.data.suggestions);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 mt-6 border rounded">
      <h2 className="text-xl font-bold">AI Meal Suggestions</h2>
      <input
        className="border p-2 w-full mt-2"
        value={preference}
        onChange={(e) => setPreference(e.target.value)}
        placeholder="e.g. high protein vegetarian"
      />
      <button className="bg-purple-500 text-white px-4 py-2 mt-2 rounded" onClick={getSuggestions}>
        Get Suggestions
      </button>
      {suggestions && (
        <div className="mt-4 p-4 bg-gray-100 whitespace-pre-line">{suggestions}</div>
      )}
    </div>
  );
}
