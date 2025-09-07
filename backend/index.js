import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import foodRoutes from "./routes/foodRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";
import aiRoutes from "./routes/aiRoutes.js";
import weightRoutes from "./routes/weightRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";





// existing code...



dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    "https://fitness-diet-frontend-43lh.onrender.com", // Render frontend URL
    "https://fitness-app7.netlify.app", // Netlify frontend URL (if still needed)
    "http://localhost:3000", // Local development
    "http://localhost:5173" // Vite dev server
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Add middleware to log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/api/ai", aiRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/weight", weightRoutes);

app.use("/api/food", foodRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
