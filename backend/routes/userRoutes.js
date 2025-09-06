import express from "express";
import { register, login, getCalorieGoal, getProteinGoal, updateProfile } from "../controller/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { setWeightGoal, getWeightGoal } from "../controller/userController.js";



const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/calorie-goal", protect, getCalorieGoal);
router.get("/protein-goal", protect, getProteinGoal);
router.post("/weight-goal", protect, setWeightGoal);
router.get("/weight-goal", protect, getWeightGoal);
router.put("/profile", protect, updateProfile);

export default router;
