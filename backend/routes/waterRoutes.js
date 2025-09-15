import express from "express";
import { addWaterIntake, getTodayWater } from "../controller/waterController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addWaterIntake);
router.get("/today", protect, getTodayWater);

export default router;
