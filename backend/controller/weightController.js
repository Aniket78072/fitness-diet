import WeightLog from "../models/WeightLog.js";
import User from "../models/User.js";


// Add new weight entry
export const addWeightLog = async (req, res) => {
  try {
    const { weight } = req.body;
    const log = await WeightLog.create({ user: req.user.id, weight });

    // Update user's current weight
    await User.findByIdAndUpdate(req.user.id, { weight });

    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get weekly weight logs
export const getWeightLogs = async (req, res) => {
  try {
    const logs = await WeightLog.find({ user: req.user.id })
      .sort({ date: 1 })
      .limit(14); // last 2 weeks
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
