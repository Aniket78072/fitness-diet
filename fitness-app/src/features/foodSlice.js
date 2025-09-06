import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const fetchFoodLogs = createAsyncThunk("food/fetchLogs", async () => {
  const res = await api.get("/food");
  return res.data;
});

export const logFoodText = createAsyncThunk("food/logText", async (query) => {
  const res = await api.post("/food/text", { query });
  return res.data;
});

export const logFoodImage = createAsyncThunk("food/logImage", async (formData) => {
  const res = await api.post("/food/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
});

const foodSlice = createSlice({
  name: "food",
  initialState: { logs: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFoodLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFoodLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchFoodLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(logFoodText.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logFoodText.fulfilled, (state, action) => {
        state.loading = false;
        state.logs.push(action.payload);
      })
      .addCase(logFoodText.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(logFoodImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logFoodImage.fulfilled, (state, action) => {
        state.loading = false;
        state.logs.push(action.payload);
      })
      .addCase(logFoodImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default foodSlice.reducer;
