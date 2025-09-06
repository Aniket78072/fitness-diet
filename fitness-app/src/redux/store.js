// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import foodReducer from "../features/foodSlice";
import workoutReducer from "./slices/workoutSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    food: foodReducer,
    workouts: workoutReducer,
  },
});

export default store;
