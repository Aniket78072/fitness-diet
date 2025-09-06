import express from "express";
import { getAISuggestions, getHistory, calculateCaloriesBurned } from "../controller/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/ai/suggestions", protect, getAISuggestions);
router.get("/ai/history", protect, getHistory);
router.post("/calculate-calories", calculateCaloriesBurned);
router.post("/suggest", getAISuggestions);
router.get("/history", protect, getHistory);

export default router;
