import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchExerciseData } from "../redux/slices/workoutSlice";
import api from "../api/axios";
import Message from "../components/Message";

export default function WorkoutTracker() {
  const dispatch = useDispatch();
  const [workouts, setWorkouts] = useState([]);
  const [exercise, setExercise] = useState("");
  const [reps, setReps] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [loadingCalories, setLoadingCalories] = useState(false);
  const [exerciseData, setExerciseData] = useState(null);
  const [loadingExerciseData, setLoadingExerciseData] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  // Fetch workouts
  const fetchWorkouts = async () => {
    const res = await api.get("/workouts");
    setWorkouts(res.data);
  };

  // Add workout
  const addWorkout = async (e) => {
    e.preventDefault();
    await api.post("/workouts", { exercise, reps, caloriesBurned });
    setExercise("");
    setReps("");
    setCaloriesBurned("");
    fetchWorkouts();
  };

  // Calculate calories burned using AI
  const calculateCalories = async () => {
    if (!exercise || !reps || reps <= 0) {
      setMessage("Please enter valid exercise and positive reps");
      setMessageType("error");
      return;
    }
    setLoadingCalories(true);
    try {
      const res = await api.post("/ai/calculate-calories", { exercise, reps });
      setCaloriesBurned(res.data.caloriesBurned);
    } catch (err) {
      setMessage("Failed to calculate calories burned: " + (err.response?.data?.error || err.message));
      setMessageType("error");
    } finally {
      setLoadingCalories(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleFetchExerciseData = async () => {
    if (!exercise) {
      setMessage("Please enter an exercise name to get data");
      setMessageType("error");
      return;
    }
    setLoadingExerciseData(true);
    setExerciseData(null);
    try {
      const data = await dispatch(fetchExerciseData(exercise)).unwrap();
      if (data.length === 0) {
        setMessage("No data found for this exercise");
        setMessageType("error");
      } else {
        setExerciseData(data[0]);
      }
    } catch (err) {
      setMessage("Failed to fetch exercise data: " + err.message);
      setMessageType("error");
    } finally {
      setLoadingExerciseData(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mt-20">Workout Tracker</h2>

      <Message message={message} type={messageType} onClose={() => setMessage(null)} />

      {/* Add Workout Form */}
      <form
        onSubmit={addWorkout}
        className="flex flex-col gap-4 max-w-md bg-white p-6 rounded-lg shadow-sm border"
      >
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="Exercise"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="border p-3 rounded text-sm flex-grow w-full"
            required
          />
          <button
            type="button"
            onClick={handleFetchExerciseData}
            disabled={loadingExerciseData}
            className="bg-purple-600 text-white px-4 py-3 rounded shadow hover:bg-purple-700 transition-colors text-sm w-full sm:w-auto whitespace-nowrap"
          >
            {loadingExerciseData ? "Loading..." : "Get Info"}
          </button>
        </div>

        <input
          type="number"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="border p-3 rounded text-sm w-full"
          required
        />

        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="number"
            placeholder="Calories Burned"
            value={caloriesBurned}
            onChange={(e) => setCaloriesBurned(e.target.value)}
            className="border p-3 rounded text-sm flex-grow w-full"
            required
          />
          <button
            type="button"
            onClick={calculateCalories}
            disabled={loadingCalories}
            className="bg-blue-600 text-white px-4 py-3 rounded shadow hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto whitespace-nowrap"
          >
            {loadingCalories ? "Calculating..." : "Calculate"}
          </button>
        </div>

        <button className="bg-green-600 text-white px-4 py-3 rounded shadow hover:bg-green-700 transition-colors text-sm w-full">
          Add Workout
        </button>
      </form>

      {/* Exercise Data Display */}
      {exerciseData && (
        <div className="max-w-md bg-blue-50 p-4 rounded-lg shadow text-black border">
          <h3 className="text-lg font-semibold mb-4">Exercise Information</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p><strong className="text-gray-700">Name:</strong> {exerciseData.name}</p>
              <p><strong className="text-gray-700">Type:</strong> {exerciseData.type}</p>
              <p><strong className="text-gray-700">Muscle:</strong> {exerciseData.muscle}</p>
              <p><strong className="text-gray-700">Equipment:</strong> {exerciseData.equipment}</p>
              <p className="sm:col-span-2"><strong className="text-gray-700">Difficulty:</strong> {exerciseData.difficulty}</p>
            </div>
            <div>
              <strong className="text-gray-700">Instructions:</strong>
              <p className="mt-2 text-sm leading-relaxed">{exerciseData.instructions}</p>
            </div>
          </div>
        </div>
      )}

      {/* Workout List */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Workout History</h3>
        {workouts.length === 0 ? (
          <p className="text-gray-800 text-center py-4">No workouts logged yet.</p>
        ) : (
          <div className="space-y-3">
            {workouts.map((w) => (
              <div
                key={w._id}
                className="flex flex-col sm:flex-row justify-between border p-3 rounded bg-gray-50 shadow-sm text-black"
              >
                <span className="font-medium text-sm sm:text-base mb-1 sm:mb-0">
                  {w.exercise} ({w.reps} reps)
                </span>
                <div className="flex flex-col sm:items-end">
                  <span className="text-red-600 font-medium text-sm">-{w.caloriesBurned} kcal</span>
                  <span className="text-xs text-gray-500">{new Date(w.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
