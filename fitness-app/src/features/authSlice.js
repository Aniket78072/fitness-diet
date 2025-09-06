import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

const token = localStorage.getItem("token");

export const registerUser = createAsyncThunk("auth/register", async (data) => {
  const res = await api.post("/users/register", data);
  return res.data;
});

export const loginUser = createAsyncThunk("auth/login", async (data) => {
  const res = await api.post("/users/login", data);
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: token || null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
