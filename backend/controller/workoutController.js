import Workout from "../models/Workout.js";
import axios from "axios";

// Add workout
export const addWorkout = async (req, res) => {
  try {
    const { exercise, reps, caloriesBurned } = req.body;
    const workout = await Workout.create({
      user: req.user.id,
      exercise,
      reps,
      caloriesBurned,
    });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all workouts
export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get exercise data from API Ninjas
export const getExerciseData = async (req, res) => {
  try {
    const { exerciseName } = req.params;
    const apiKey = "i0zqGUMXaqbogrqIEm5WVw==9bfMK3YpqIDz7oAd";

    const response = await axios.get(`https://api.api-ninjas.com/v1/exercises?name=${exerciseName}`, {
      headers: {
        'X-Api-Key': apiKey
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error('API Ninjas error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch exercise data' });
  }
};
