import mongoose from "mongoose";

const aiSuggestionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  preference: { type: String, enum: ["veg", "non-veg"], required: true },
  dailyCalories: { type: Number, required: true },
  customPrompt: { type: String, required: false },  // Added customPrompt field
  suggestion: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("AISuggestion", aiSuggestionSchema);
