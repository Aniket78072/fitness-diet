// src/redux/mealSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Fetch all meals from backend
export const fetchMeals = createAsyncThunk("meals/fetchMeals", async () => {
  const res = await api.get("/food");
  return res.data;
});

// Add a meal to backend
export const addMeal = createAsyncThunk("meals/addMeal", async (mealData) => {
  const res = await api.post("/food/text", mealData);
  return res.data;
});

const mealSlice = createSlice({
  name: "meals",
  initialState: {
    meals: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch meals
      .addCase(fetchMeals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMeals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.meals = action.payload;
      })
      .addCase(fetchMeals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Add meal
      .addCase(addMeal.fulfilled, (state, action) => {
        state.meals.unshift(action.payload);
      });
  },
});

export default mealSlice.reducer;
