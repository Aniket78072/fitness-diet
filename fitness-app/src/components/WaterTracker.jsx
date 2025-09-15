import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTodayWater, addWaterIntake } from "../redux/slices/waterSlice";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const WaterTracker = () => {
  const dispatch = useDispatch();
  const { todayIntake, goal, loading, error } = useSelector((state) => state.water);
  const [message, setMessage] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    dispatch(fetchTodayWater());
  }, [dispatch]);

  useEffect(() => {
    if (goal === 0) {
      setMessage("");
      return;
    }
    const progress = todayIntake / goal;
    if (progress === 0) {
      setMessage("Start hydrating! 💧");
    } else if (progress < 0.5) {
      setMessage("Keep going! 💧 You’re halfway there!");
    } else if (progress < 1) {
      setMessage("Almost there! 💦 Keep it up!");
    } else {
      setMessage("Great job! 🎉 You reached your daily goal!");
    }
  }, [todayIntake, goal]);

  const handleAddWater = (amount) => {
    console.log("Adding water:", amount);
    dispatch(addWaterIntake(amount));
  };

  const progressPercent = goal > 0 ? Math.min((todayIntake / goal) * 100, 100) : 0;

  return (
    <div className="p-4 rounded-lg shadow-sm bg-blue-50 max-w-md mx-auto w-full sm:w-auto">
      <h3 className="text-xl font-semibold mb-4 text-center">
        Water Tracker
      </h3>

      {/* Weight Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Weight (kg) for Goal Calculation
        </label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Enter weight"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        {weight && (
          <p className="text-xs text-gray-600 mt-1">
            Suggested daily goal: {Math.round(parseFloat(weight) * 0.033 * 1000)} ml
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex justify-center mb-4">
        <div style={{ width: 120, height: 120 }}>
          <CircularProgressbar
            value={progressPercent}
            text={`${(todayIntake / 1000).toFixed(2)}L`}
            styles={buildStyles({
              textColor: "#3b82f6",
              pathColor: "#3b82f6",
              trailColor: "#d1d5db",
              textSize: "12px",
            })}
          />
        </div>
      </div>

      {/* Animated Water Glass */}
      <div className="flex justify-center mb-4">
        <div
          className={`w-16 h-24 bg-blue-200 rounded-b-full border-2 border-blue-400 relative overflow-hidden transition-transform duration-300 ${
            progressPercent >= 100 ? 'scale-110' : 'scale-100'
          }`}
        >
          <div
            className="absolute bottom-0 w-full bg-blue-500 transition-all duration-500"
            style={{ height: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4">
        <button
          onClick={() => handleAddWater(200)}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 active:scale-95 transition-all duration-150 text-sm w-full sm:w-auto disabled:opacity-50"
          disabled={loading}
        >
          +200ml
        </button>
        <button
          onClick={() => handleAddWater(250)}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 active:scale-95 transition-all duration-150 text-sm w-full sm:w-auto disabled:opacity-50"
          disabled={loading}
        >
          +1 Glass (250ml)
        </button>
      </div>

      {/* Message */}
      {message && (
        <p
          className="text-center text-blue-700 font-medium text-sm animate-fade-in"
        >
          {message}
        </p>
      )}

      {error && (
        <p className="text-center text-red-500 text-sm mt-2">
          Error: {error}
        </p>
      )}
    </div>
  );
};

export default WaterTracker;
