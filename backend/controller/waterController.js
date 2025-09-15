import WaterLog from "../models/WaterLog.js";
import WeightLog from "../models/WeightLog.js";

// Helper to get today's date at midnight
const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// POST /api/water/add
export const addWaterIntake = async (req, res) => {
  try {
    const userId = req.user.id;
    const { intake, weight } = req.body; // intake in ml, weight in kg (optional)

    if (!intake || typeof intake !== 'number' || intake <= 0) {
      return res.status(400).json({ error: "Intake must be a positive number" });
    }

    // If weight provided, update weight log
    if (weight && typeof weight === 'number' && weight > 0) {
      // Reuse existing addWeightLog logic
      const WeightLog = (await import("../models/WeightLog.js")).default;
      const existingWeightLog = await WeightLog.findOne({ user: userId, date: { $gte: new Date(new Date().setHours(0,0,0,0)) } });
      if (!existingWeightLog) {
        await WeightLog.create({ user: userId, weight });
      } else {
        existingWeightLog.weight = weight;
        await existingWeightLog.save();
      }
    }

    const today = getTodayDate();

    // Find existing water log for today
    let waterLog = await WaterLog.findOne({ userId, date: today });

    // If no log, get latest weight to calculate goal
    if (!waterLog) {
      const latestWeightLog = await WeightLog.findOne({ user: userId }).sort({ date: -1 });
      const weightKg = latestWeightLog ? latestWeightLog.weight : 70; // default 70kg if none
      const goal = Math.round(weightKg * 33); // ml

      waterLog = new WaterLog({
        userId,
        date: today,
        intake,
        goal,
      });
    } else {
      waterLog.intake += intake;
    }

    await waterLog.save();

    res.json(waterLog);
  } catch (err) {
    console.error("Error in addWaterIntake:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/water/today
export const getTodayWater = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDate();

    let waterLog = await WaterLog.findOne({ userId, date: today });

    if (!waterLog) {
      const latestWeightLog = await WeightLog.findOne({ user: userId }).sort({ date: -1 });
      const weightKg = latestWeightLog ? latestWeightLog.weight : 70; // default 70kg if none
      const goal = Math.round(weightKg * 33); // ml

      waterLog = {
        intake: 0,
        goal,
      };
    }

    res.json({
      intake: waterLog.intake,
      goal: waterLog.goal,
    });
  } catch (err) {
    console.error("Error in getTodayWater:", err);
    res.status(500).json({ error: err.message });
  }
};
