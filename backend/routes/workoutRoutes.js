import express from "express";
import { addWorkout, getWorkouts, getExerciseData } from "../controller/workoutController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addWorkout);
router.get("/", protect, getWorkouts);
router.get("/exercise-data/:exerciseName", protect, getExerciseData);

export default router;
