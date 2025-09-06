import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../features/authSlice";
import { useNavigate } from "react-router-dom";
import Message from "../components/Message";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Clear any existing token when entering login page
  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Clear any existing token before login attempt
    localStorage.removeItem("token");

    const resultAction = await dispatch(loginUser(form));
    setLoading(false);
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/home");
    } else {
      setMessage("Login failed: " + (resultAction.error.message || "Unknown error"));
      setMessageType("error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fadeInUp">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <Message message={message} type={messageType} onClose={() => setMessage(null)} />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border border-gray-300 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {loading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-center text-blue-700">
            Signing you in...
          </div>
        )}
      </div>
    </div>
  );
}
