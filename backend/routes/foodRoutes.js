import express from "express";
import multer from "multer";
import { logFoodByText, logFoodByImage, getFoodLogs, updateDailyFoodSummary, getDailyFoodSummary, getWeeklyFoodSummaries } from "../controller/foodController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", protect, getFoodLogs);
router.post("/text", protect, logFoodByText);
router.post("/image", protect, upload.single("foodImage"), logFoodByImage);

// Daily food summary routes
router.post("/update-daily-summary", protect, updateDailyFoodSummary);
router.get("/daily-summary", protect, getDailyFoodSummary);
router.get("/weekly-summaries", protect, getWeeklyFoodSummaries);

export default router;
