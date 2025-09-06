import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FoodLog from "./pages/FoodLog";
import Suggestions from "./pages/Suggestion";
import WorkoutTracker from "./pages/WorkoutTracker";
import AITrainer from "./pages/AITrainer";
import Home from "./pages/Home";
import "./index.css";

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/food-log" element={<ProtectedRoute><FoodLog /></ProtectedRoute>} />
        <Route path="/suggestions" element={<ProtectedRoute><Suggestions /></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><WorkoutTracker /></ProtectedRoute>} />
        <Route path="/ai-trainer" element={<ProtectedRoute><AITrainer /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
