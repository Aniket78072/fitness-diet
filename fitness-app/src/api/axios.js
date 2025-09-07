// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
// });

// // Add a request interceptor to include the token in headers
// api.interceptors.request.use(
//   (config) => {
//     console.log("Axios request:", config.url, config.method);
//     const token = localStorage.getItem("token");
//     console.log("Token from localStorage:", token ? "Present" : "Not present");

//     // List of public endpoints that don't require authentication
//     const publicEndpoints = [
//       '/ai/calculate-calories',
//       'suggestion'
//     ];

//     // Check if the current request is to a public endpoint
//     const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));

//     if (token && !isPublicEndpoint) {
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log("Added Authorization header");
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;

import axios from "axios";
import { useState } from "react";

function AISuggestion() {
  const [prompt, setPrompt] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const getSuggestion = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "https://fitness-diet-backend-8bsp.onrender.com/api/ai/suggestions",
        { prompt }
      );
      // OpenRouter response structure → choices[0].message.content
      setSuggestion(res.data.choices[0].message.content);
    } catch (error) {
      console.error("Error fetching AI suggestion:", error.response?.data || error.message);
      setSuggestion("Failed to fetch AI suggestion. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt"
      />
      <button onClick={getSuggestion} disabled={loading}>
        {loading ? "Loading..." : "Get Suggestion"}
      </button>
      <div>
        <h3>AI Suggestion:</h3>
        <p>{suggestion}</p>
      </div>
    </div>
  );
}

export default AISuggestion;
