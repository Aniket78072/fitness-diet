import mongoose from "mongoose";

const dailyFoodSummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  foodLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoodLog" }],
}, { timestamps: true });

// Compound index to ensure one summary per user per day
dailyFoodSummarySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyFoodSummary", dailyFoodSummarySchema);
