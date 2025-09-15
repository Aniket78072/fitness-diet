import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Fetch today's water intake and goal
export const fetchTodayWater = createAsyncThunk(
  "water/fetchTodayWater",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/water/today");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add water intake
export const addWaterIntake = createAsyncThunk(
  "water/addWaterIntake",
  async ({ intake, weight }, { rejectWithValue }) => {
    try {
      const response = await api.post("/water/add", { intake, weight });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const waterSlice = createSlice({
  name: "water",
  initialState: {
    todayIntake: 0,
    goal: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayWater.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodayWater.fulfilled, (state, action) => {
        state.loading = false;
        state.todayIntake = action.payload.intake;
        state.goal = action.payload.goal;
        state.error = null;
      })
      .addCase(fetchTodayWater.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addWaterIntake.pending, (state) => {
        state.loading = true;
      })
      .addCase(addWaterIntake.fulfilled, (state, action) => {
        state.loading = false;
        state.todayIntake = action.payload.intake;
        state.goal = action.payload.goal;
        state.error = null;
      })
      .addCase(addWaterIntake.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default waterSlice.reducer;
