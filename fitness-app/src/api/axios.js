import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    console.log("Axios request:", config.url, config.method);
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token ? "Present" : "Not present");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added Authorization header");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
