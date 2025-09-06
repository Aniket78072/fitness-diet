import { useState } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "../features/authSlice";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(registerUser(form)).then(() => {
      setLoading(false);
      setShowWelcome(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 3000); // Show welcome message for 3 seconds then redirect
    });
  };

  if (showWelcome) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center animate-fadeInUp">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Welcome!</h2>
          <p className="text-lg text-gray-700 mb-4">Thanks for choosing us.</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fadeInUp">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            placeholder="Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        {loading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-center text-blue-700">
            Creating your account...
          </div>
        )}
      </div>
    </div>
  );
}
