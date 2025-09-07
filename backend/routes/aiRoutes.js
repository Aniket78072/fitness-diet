import express from "express";
import { getAISuggestions, getHistory, calculateCaloriesBurned } from "../controller/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/ai/suggestions", protect, getAISuggestions);
router.get("/ai/history", protect, getHistory);

        // Public routes (no authentication required)
router.post("/calculate-calories", calculateCaloriesBurned);
    // router.post("/suggest", getAISuggestions);

export default router;
