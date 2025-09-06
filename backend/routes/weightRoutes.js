import express from "express";
import { addWeightLog, getWeightLogs } from "../controller/weightController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addWeightLog);
router.get("/", protect, getWeightLogs);

export default router;
