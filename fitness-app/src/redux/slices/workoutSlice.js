// src/redux/workoutSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Fetch all workouts
export const fetchWorkouts = createAsyncThunk("workouts/fetchWorkouts", async () => {
  const res = await api.get("/workouts");
  return res.data;
});

// Add a workout
export const addWorkout = createAsyncThunk("workouts/addWorkout", async (workoutData) => {
  const res = await api.post("/workouts", workoutData);
  return res.data;
});

// Fetch exercise data from API Ninjas
export const fetchExerciseData = createAsyncThunk("workouts/fetchExerciseData", async (exerciseName) => {
  const res = await api.get(`/workouts/exercise-data/${exerciseName}`);
  return res.data;
});

const workoutSlice = createSlice({
  name: "workouts",
  initialState: {
    workouts: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkouts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.workouts = action.payload;
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Add workout
      .addCase(addWorkout.fulfilled, (state, action) => {
        state.workouts.unshift(action.payload);
      });
  },
});

export default workoutSlice.reducer;
