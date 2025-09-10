import FoodLog from "../models/FoodLog.js";
import DailyFoodSummary from "../models/DailyFoodSummary.js";
import User from "../models/User.js";
import { getFoodData } from "../utils/nutritionix.js";
// Removed analyzeFoodImage import - Gemini functionality removed

// Parse quantity and food name from user input
const parseFoodQuery = (query) => {
  const lowerQuery = query.toLowerCase().trim();

  // Patterns to match quantities:
  // - "250g chicken breast" -> quantity: 250, unit: "g", food: "chicken breast"
  // - "2 eggs" -> quantity: 2, unit: "eggs", food: "egg"
  // - "1 apple" -> quantity: 1, unit: "apple", food: "apple"
  // - "chicken breast" -> quantity: 100, unit: "g", food: "chicken breast" (default)

  // Match patterns like "250g", "2", "1.5kg", "3 eggs", etc.
  const quantityPatterns = [
    // Weight patterns: 250g, 1.5kg, 500ml, etc.
    /(\d+(?:\.\d+)?)\s*(g|kg|ml|l|oz|lb)/i,
    // Count patterns: 2 eggs, 3 apples, etc.
    /(\d+(?:\.\d+)?)\s*(eggs?|apples?|bananas?|pieces?|servings?|rotis?)/i,
    // Simple numbers: 2, 1.5, etc.
    /^(\d+(?:\.\d+)?)\s+/,
  ];

  for (const pattern of quantityPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const quantity = parseFloat(match[1]);
      const unit = match[2] || '';
      const foodName = lowerQuery.replace(match[0], '').trim();

      // Convert units to grams for consistency
      let normalizedQuantity = quantity;
      let isCountable = false;

      if (unit === 'kg') {
        normalizedQuantity = quantity * 1000; // kg to g
      } else if (unit === 'oz') {
        normalizedQuantity = quantity * 28.35; // oz to g
      } else if (unit === 'lb') {
        normalizedQuantity = quantity * 453.59; // lb to g
      } else if (unit === 'ml' || unit === 'l') {
        // For liquids, assume density ~1g/ml, so ml/l ≈ g
        normalizedQuantity = unit === 'l' ? quantity * 1000 : quantity;
      } else if (unit.match(/eggs?|apples?|bananas?|pieces?|servings?|rotis?/i)) {
        // For countable items, keep as count but assume base is 1 unit
        normalizedQuantity = quantity;
        isCountable = true;
      } else if (!unit || unit === 'g') {
        // Already in grams or no unit specified
        normalizedQuantity = quantity;
      }

      return {
        quantity: normalizedQuantity,
        foodName: foodName || query, // fallback to original query
        originalQuery: query,
        isCountable: isCountable
      };
    }
  }

  // No quantity found, assume default 100g
  return {
    quantity: 100,
    foodName: query,
    originalQuery: query,
    isCountable: false
  };
};

export const logFoodByText = async (req, res) => {
  try {
    console.log("logFoodByText called with query:", req.body.query);
    const { query } = req.body;

    // Parse quantity and food name from query
    const { quantity, foodName, isCountable } = parseFoodQuery(query);
    console.log("Parsed quantity:", quantity, "foodName:", foodName, "isCountable:", isCountable);

    // Get nutritional data for the base food item
    const data = await getFoodData(foodName);
    console.log("Food data received:", data);
    const food = data.foods[0];

    // Calculate nutritional values based on quantity
    // For countable items (eggs, apples), base data is per 1 unit, so multiplier = quantity
    // For weight-based items, base data is per 100g, so multiplier = quantity / 100
    const multiplier = isCountable ? quantity : quantity / 100;
    const adjustedCalories = Math.round(food.nf_calories * multiplier);
    const adjustedProtein = Math.round(food.nf_protein * multiplier * 10) / 10; // Round to 1 decimal
    const adjustedFat = Math.round(food.nf_total_fat * multiplier * 10) / 10;
    const adjustedCarbs = Math.round(food.nf_total_carbohydrate * multiplier * 10) / 10;

    console.log("Adjusted nutritional values:", {
      original: { calories: food.nf_calories, protein: food.nf_protein },
      adjusted: { calories: adjustedCalories, protein: adjustedProtein }
    });

    const log = await FoodLog.create({
      user: req.user.id,
      foodName: query, // Store the original query with quantity
      calories: adjustedCalories,
      protein: adjustedProtein,
      fat: adjustedFat,
      carbs: adjustedCarbs,
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
