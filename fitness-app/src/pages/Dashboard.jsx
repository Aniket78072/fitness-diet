import { useEffect, useState } from "react";
import api from "../api/axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "react-circular-progressbar/dist/styles.css";
import Message from "../components/Message";

export default function Dashboard() {
  const [calorieGoal, setCalorieGoal] = useState(0);
  const [proteinGoal, setProteinGoal] = useState(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [proteinConsumed, setProteinConsumed] = useState(0);
  const [latestSuggestion, setLatestSuggestion] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [weightData, setWeightData] = useState({ currentWeight: 0, targetWeight: 0 });
  const [weightLogs, setWeightLogs] = useState([]);
  const [workouts, setWorkouts] = useState([]);
const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [currentWeightInput, setCurrentWeightInput] = useState('');
  const [targetWeightInput, setTargetWeightInput] = useState('');
  const [profileData, setProfileData] = useState({
    age: '',
    height: '',
    gender: '',
    activityLevel: '',
    goal: '',
  });
  const [foodInput, setFoodInput] = useState('');

  const token = localStorage.getItem("token");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  // Fetch calorie goal
  const fetchCalorieGoal = async () => {
    const res = await api.get("/users/calorie-goal");
    setCalorieGoal(res.data.dailyCalories);
  };

  // Fetch protein goal
  const fetchProteinGoal = async () => {
    const res = await api.get("/users/protein-goal");
    setProteinGoal(res.data.dailyProtein);
  };



// Fetch workouts
const fetchWorkouts = async () => {
  const res = await api.get("/workouts");
  setWorkouts(res.data);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toDateString();
  const todaysWorkouts = res.data.filter(w => new Date(w.date).toDateString() === todayStr);
  const totalBurned = todaysWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  setCaloriesBurned(totalBurned);
};

  // Fetch daily food summary
  const fetchDailyFoodSummary = async () => {
    try {
      const res = await api.get("/food/daily-summary");
      setFoodLogs(res.data.foodLogs || []);
      setCaloriesConsumed(res.data.totalCalories || 0);
      setProteinConsumed(res.data.totalProtein || 0);
    } catch (error) {
      console.error("Error fetching daily food summary:", error);
      setMessage("Failed to fetch daily food summary: " + error.message);
      setMessageType("error");
    }
  };

  // Fetch latest AI suggestion
  const fetchLatestSuggestion = async () => {
    const res = await api.get("/ai/history");
    if (res.data.length > 0) {
      setLatestSuggestion(res.data[0]);
    }
  };

  // Fetch weight goal
  const fetchWeightGoal = async () => {
    const res = await api.get("/users/weight-goal");
    setWeightData(res.data);
  };

  // Fetch weight logs
  const fetchWeightLogs = async () => {
    const res = await api.get("/weight");
    setWeightLogs(
      res.data.map((log) => ({
        date: new Date(log.date).toLocaleDateString(),
        weight: log.weight,
      }))
    );
  };

  // Add new weight entry
  const addWeightEntry = async () => {
    const weight = prompt("Enter your current weight (kg):");
    if (!weight) return;

    console.log("Token from localStorage:", token);

    try {
      await api.post("/weight", { weight });
      await fetchWeightLogs();
      await fetchWeightGoal();
    } catch (error) {
      console.error("Error adding weight entry:", error);
      setMessage("Failed to add weight entry: " + error.message);
      setMessageType("error");
    }
  };

  // Set weight goal
  const setWeightGoal = async () => {
    if (!currentWeightInput || !targetWeightInput) return;

    try {
      await api.post("/users/weight-goal", { currentWeight: parseFloat(currentWeightInput), targetWeight: parseFloat(targetWeightInput) });
      await fetchWeightGoal();
      setCurrentWeightInput('');
      setTargetWeightInput('');
    } catch (error) {
      console.error("Error setting weight goal:", error);
      setMessage("Failed to set weight goal: " + error.message);
      setMessageType("error");
    }
  };

  // Update profile
  const updateProfile = async () => {
    try {
      await api.put("/users/profile", profileData);
      setMessage("Profile updated successfully!");
      setMessageType("info");
      await fetchCalorieGoal(); // Refresh calorie goal after profile update
      setProfileData({
        age: '',
        height: '',
        gender: '',
        activityLevel: '',
        goal: '',
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile: " + error.message);
      setMessageType("error");
    }
  };

  // Log food
  const logFood = async () => {
    if (!foodInput.trim()) return;

    try {
      await api.post("/food/text", { query: foodInput });
      setMessage("Food logged successfully!");
      setMessageType("info");
      setFoodInput('');
      await fetchDailyFoodSummary(); // Refresh daily food summary
    } catch (error) {
      console.error("Error logging food:", error);
      setMessage("Failed to log food: " + error.message);
      setMessageType("error");
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await fetchCalorieGoal();
    await fetchProteinGoal();
    await fetchDailyFoodSummary();
    await fetchLatestSuggestion();
    await fetchWeightGoal();
    await fetchWeightLogs();
    await fetchWorkouts();
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Progress %
  const { currentWeight, targetWeight } = weightData;
  const weightProgress =
    currentWeight && targetWeight
      ? ((Math.abs(currentWeight - targetWeight)) /
          Math.abs(currentWeight > targetWeight ? currentWeight : targetWeight)) *
        100
      : 0;
  const netCalories = caloriesConsumed - caloriesBurned;
  const calorieProgress =
    calorieGoal > 0 ? (netCalories / calorieGoal) * 100 : 0;
  const proteinProgress =
    proteinGoal > 0 ? (proteinConsumed / proteinGoal) * 100 : 0;




  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mt-30">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {/* Calorie Goal */}
     <div className="flex gap-8 items-center">
  <div className="w-40 h-40">
    <CircularProgressbar
      value={calorieProgress}
      text={`${Math.round(calorieProgress)}%`}
      styles={buildStyles({
        textColor: "#22c55e",
        pathColor: "#22c55e",
        trailColor: "#d1d5db",
      })}
    />
  </div>
  <div>
    <h3 className="text-xl font-semibold">Daily Calorie Goal</h3>
    <p>
      Net: {netCalories} kcal (Eaten {caloriesConsumed} - Burned {caloriesBurned}) /{" "}
      {calorieGoal} kcal
    </p>
  </div>
</div>

      {/* Protein Goal */}
      <div className="flex gap-8 items-center">
        <div className="w-40 h-40">
          <CircularProgressbar
            value={proteinProgress}
            text={`${Math.round(proteinProgress)}%`}
            styles={buildStyles({
              textColor: "#f59e0b",
              pathColor: "#f59e0b",
              trailColor: "#d1d5db",
            })}
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Daily Protein Goal</h3>
          <p>
            Consumed: {proteinConsumed} g / {proteinGoal} g
          </p>
        </div>
      </div>

      {/* Weight Goal */}
      <div className="flex gap-8 items-center">
        <div className="w-40 h-40">
          <CircularProgressbar
            value={weightProgress}
            text={`${Math.round(weightProgress)}%`}
            styles={buildStyles({
              textColor: "#3b82f6",
              pathColor: "#3b82f6",
              trailColor: "#d1d5db",
            })}
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Weight Goal</h3>
          <p>
            Current: {currentWeight} kg → Target: {targetWeight} kg
          </p>
          <div className="mt-2 flex gap-2 items-center">
            <input
              type="number"
              placeholder="Current Weight (kg)"
              value={currentWeightInput}
              onChange={(e) => setCurrentWeightInput(e.target.value)}
              className="px-2 py-1 border rounded w-32"
            />
            <input
              type="number"
              placeholder="Target Weight (kg)"
              value={targetWeightInput}
              onChange={(e) => setTargetWeightInput(e.target.value)}
              className="px-2 py-1 border rounded w-32"
            />
            <button
              onClick={setWeightGoal}
              className="px-4 py-1 bg-green-600 text-white rounded shadow"
            >
              Set Goal
            </button>
          </div>
          <button
            onClick={addWeightEntry}
            className="mt-2 px-4 py-1 bg-blue-600 text-white rounded shadow"
          >
            Add Weight Entry
          </button>
        </div>
      </div>

      {/* Profile Setup */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Update Profile (for Calorie Goal Calculation)</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Age"
            value={profileData.age}
            onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
            className="px-2 py-1 border rounded"
          />
          <input
            type="number"
            placeholder="Height (cm)"
            value={profileData.height}
            onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
            className="px-2 py-1 border rounded"
          />
          <select
            value={profileData.gender}
            onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
            className="px-2 py-1 border rounded"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select
            value={profileData.activityLevel}
            onChange={(e) => setProfileData({ ...profileData, activityLevel: e.target.value })}
            className="px-2 py-1 border rounded"
          >
            <option value="">Select Activity Level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            value={profileData.goal}
            onChange={(e) => setProfileData({ ...profileData, goal: e.target.value })}
            className="px-2 py-1 border rounded"
          >
            <option value="">Select Goal</option>
            <option value="lose">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
            <option value="gain">Gain Weight</option>
          </select>
          <button
            onClick={updateProfile}
            className="px-4 py-1 bg-purple-600 text-white rounded shadow"
          >
            Update Profile
          </button>
        </div>
      </div>

      {/* Weekly Weight Progress Chart */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Weight Progress</h3>
        {weightLogs.length === 0 ? (
          <p className="text-gray-500">No weight entries yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weightLogs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Latest Suggestion */}
      {latestSuggestion && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">AI Meal Suggestion</h3>
          <p className="whitespace-pre-line text-sm">{latestSuggestion.suggestion}</p>
          <p className="text-xs text-gray-500 mt-2">
            {latestSuggestion.preference.toUpperCase()} • {latestSuggestion.dailyCalories} kcal •{" "}
            {new Date(latestSuggestion.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Food Logs */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Log Food</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter food name (e.g., '1 apple' or 'chicken breast 200g')"
            value={foodInput}
            onChange={(e) => setFoodInput(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={logFood}
            className="px-4 py-2 bg-orange-600 text-white rounded shadow"
          >
            Log Food
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-2">Your Food Logs</h3>
        {foodLogs.length === 0 ? (
          <p className="text-black-500">No food logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {foodLogs.map((item) => (
              <li
                key={item._id}
                className="flex justify-between border p-2 rounded bg-white shadow-sm text-black"
              >
                <span>{item.foodName}</span>
                <span className="text-black-700">{item.calories} kcal, {item.protein || 0} g protein</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Workouts */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Recent Workouts</h3>
        {workouts.length === 0 ? (
          <p className="text-gray-500">No workouts logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {workouts.slice(0, 5).map((w) => (
              <li
                key={w._id}
                className="flex justify-between border p-2 rounded bg-white shadow-sm text-black"
              >
                <span>
                  {w.exercise} ({w.reps} reps) - {new Date(w.date).toLocaleDateString()}
                </span>
                <span className="text-red-600">-{w.caloriesBurned} kcal</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
