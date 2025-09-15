import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { fetchTodayWater, addWaterIntake } from "../redux/slices/waterSlice";

export default function WaterTracker() {
  const dispatch = useDispatch();
  const { todayIntake, goal, loading, error } = useSelector((state) => state.water);
  const [weight, setWeight] = useState("");

  useEffect(() => {
    dispatch(fetchTodayWater());
  }, [dispatch]);

  const handleAddWater = (amount) => {
    console.log("Adding water:", amount, "with weight:", weight);
    dispatch(addWaterIntake({ intake: amount, weight: weight ? parseFloat(weight) : undefined }));
  };

  const progress = goal > 0 ? (todayIntake / goal) * 100 : 0;
  const fillHeight = Math.min(progress, 100);

  const getMessage = () => {
    if (weight) {
      return `Based on your weight, you need to drink ${goal} ml. You have drunk ${todayIntake} ml so far.`;
    }
    if (progress < 50) return "Keep going! 💧 You're halfway there!";
    if (progress >= 100) return "Great job! 🎉 You reached your daily goal!";
    return "Almost there! 💪";
  };

  // Show message only briefly after adding water or on error
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState("");

  // Calculate remaining water to drink
  const remainingWater = Math.max(goal - todayIntake, 0);

  useEffect(() => {
    if (error) {
      setMessageText(`Error: ${error}`);
      setShowMessage(true);
    }
  }, [error]);

  useEffect(() => {
    if (!loading && !error) {
      setMessageText(getMessage());
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [todayIntake, goal, loading, error, weight]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Water Tracker</h2>

      {/* Weight Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Enter your weight (kg):</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="e.g., 70"
        />
        {weight && (
          <p className="text-sm text-gray-600 mt-1">
            Suggested daily intake: {Math.round(parseFloat(weight) * 0.033 * 1000)} ml
          </p>
        )}
      </div>

      {/* Water Glass Animation */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-48 bg-blue-100 border-4 border-blue-300 rounded-b-lg overflow-hidden">
          <motion.div
            className="absolute bottom-0 w-full bg-blue-400"
            initial={{ height: 0 }}
            animate={{ height: `${fillHeight}%` }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">💧</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <motion.div
            className="bg-blue-500 h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-center mt-2 text-sm">
          {todayIntake} ml / {goal} ml ({Math.round(progress)}%)
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => handleAddWater(200)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          +200ml
        </button>
        <button
          onClick={() => handleAddWater(250)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          +1 Glass
        </button>
      </div>

      {/* Message */}
      {showMessage && <p className="text-center text-lg text-black font-medium">{messageText}</p>}

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
}
