import FoodLog from "../models/FoodLog.js";
import DailyFoodSummary from "../models/DailyFoodSummary.js";
import User from "../models/User.js";
import { getFoodData } from "../utils/nutritionix.js";
// Removed analyzeFoodImage import - Gemini functionality removed

export const logFoodByText = async (req, res) => {
  try {
    console.log("logFoodByText called with query:", req.body.query);
    const { query } = req.body;
    const data = await getFoodData(query);
    console.log("Food data received:", data);
    const food = data.foods[0];

    const log = await FoodLog.create({
      user: req.user.id,
      foodName: food.food_name,
      calories: food.nf_calories,
      protein: food.nf_protein,
      fat: food.nf_total_fat,
      carbs: food.nf_total_carbohydrate,
    });

    // Update daily food summary after logging food
    await updateDailyFoodSummary(req.user.id);

    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Removed logFoodByImage function - Gemini image analysis functionality removed

export const getFoodLogs = async (req, res) => {
  try {
    const logs = await FoodLog.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update daily food summary for a specific date
export const updateDailyFoodSummary = async (userId, date = null) => {
  try {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all food logs for the user on this date
    const foodLogs = await FoodLog.find({
      user: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Calculate totals
    const totals = foodLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      fat: acc.fat + (log.fat || 0),
      carbs: acc.carbs + (log.carbs || 0)
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

    // Update or create daily summary
    const summary = await DailyFoodSummary.findOneAndUpdate(
      { user: userId, date: startOfDay },
      {
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalFat: totals.fat,
        totalCarbs: totals.carbs,
        foodLogs: foodLogs.map(log => log._id)
      },
      { upsert: true, new: true }
    );

    return summary;
  } catch (err) {
    console.error("Error updating daily food summary:", err);
    throw err;
  }
};

// Get daily food summary for today
export const getDailyFoodSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const summary = await DailyFoodSummary.findOne({
      user: req.user.id,
      date: today
    }).populate('foodLogs');

    // Get user's current weight for protein goal calculation
    const user = await User.findById(req.user.id);
    const proteinGoal = user && user.weight ? Math.round(user.weight * 1.6) : 0;

    if (!summary) {
      // Return empty summary if none exists
      res.json({
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
        foodLogs: [],
        proteinGoal
      });
    } else {
      res.json({
        ...summary.toObject(),
        proteinGoal
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get daily food summaries for the last 7 days
export const getWeeklyFoodSummaries = async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const summaries = await DailyFoodSummary.find({
      user: req.user.id,
      date: { $gte: weekAgo, $lte: today }
    }).sort({ date: 1 });

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
