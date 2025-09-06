import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || "defaultsecret", { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ token: generateToken(user._id) });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCalorieGoal = (req, res) => {
  const { weight, targetWeight, height, age, gender, activityLevel, goal } = req.user;

  // Use target weight if available, otherwise current weight
  const weightForBMR = targetWeight || weight;

  // Mifflin-St Jeor Formula
  let bmr = gender === "male"
    ? 10 * weightForBMR + 6.25 * height - 5 * age + 5
    : 10 * weightForBMR + 6.25 * height - 5 * age - 161;

  const activityFactor = activityLevel === "low" ? 1.2 : activityLevel === "medium" ? 1.55 : 1.725;
  let calories = bmr * activityFactor;

  if (goal === "lose") calories -= 500;
  else if (goal === "gain") calories += 500;

  res.json({ dailyCalories: Math.round(calories) });
};

export const getProteinGoal = (req, res) => {
  const { weight, targetWeight } = req.user;

  // Use target weight if available, otherwise current weight
  const weightForProtein = targetWeight || weight;

  // Simple calculation: weight * 1.6 g/kg as requested
  const dailyProtein = weightForProtein ? Math.round(weightForProtein * 1.6) : 0;

  res.json({ dailyProtein });
};

// Set weight goal
export const setWeightGoal = async (req, res) => {
  try {
    const { currentWeight, targetWeight } = req.body;
    const user = await User.findById(req.user.id);

    user.weight = currentWeight;
    user.targetWeight = targetWeight;
    await user.save();

    res.json({
      message: "Weight goal updated",
      currentWeight: user.weight,
      targetWeight: user.targetWeight,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get weight goal
export const getWeightGoal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      currentWeight: user.weight,
      targetWeight: user.targetWeight,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { age, height, gender, activityLevel, goal } = req.body;
    const user = await User.findById(req.user.id);

    if (age !== undefined) user.age = age;
    if (height !== undefined) user.height = height;
    if (gender !== undefined) user.gender = gender;
    if (activityLevel !== undefined) user.activityLevel = activityLevel;
    if (goal !== undefined) user.goal = goal;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        age: user.age,
        height: user.height,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goal: user.goal,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
