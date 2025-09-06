import mongoose from "mongoose";

const foodLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  foodName: String,
  calories: Number,
  protein: Number,
  fat: Number,
  carbs: Number,
  imageUrl: String,
}, { timestamps: true });

export default mongoose.model("FoodLog", foodLogSchema);
