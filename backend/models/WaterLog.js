import mongoose from "mongoose";

const waterLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  intake: { type: Number, required: true }, // ml
  goal: { type: Number, required: true }, // ml
});

export default mongoose.model("WaterLog", waterLogSchema);
