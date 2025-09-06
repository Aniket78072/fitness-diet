import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
  weight: Number,
  height: Number,
   targetWeight: Number,
  gender: { type: String, enum: ["male", "female"] },
  activityLevel: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  goal: { type: String, enum: ["lose", "maintain", "gain"], default: "maintain" },
}, { timestamps: true });




userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
