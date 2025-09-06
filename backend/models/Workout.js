import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  exercise: { type: String, required: true },
  reps: { type: Number, required: true },
  caloriesBurned: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Workout", workoutSchema);
