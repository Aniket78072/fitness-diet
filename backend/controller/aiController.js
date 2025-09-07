import OpenAI from "openai";
import AISuggestion from "../models/AISuggestion.js";

let client;

const getClient = () => {
  console.log("DEEPSEEK_API_KEY:", process.env.OPENROUTER_API_KEY ? "Set" : "Not set");
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY environment variable is not set. Please add it to your .env file.");
  }
  if (!client) {
    client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
    console.log("DeepSeek client initialized with OpenRouter");
  } else {
    console.log("DeepSeek client already initialized");
  }
  return client;
};
// Create new suggestion
export const getAISuggestions = async (req, res) => {
  try {
    let { dailyCalories, preference, customPrompt } = req.body;
    console.log("AI Request:", { dailyCalories, preference, customPrompt });

    // Validate preference to match enum ["veg", "non-veg"]
    if (preference !== "veg" && preference !== "non-veg") {
      preference = "veg"; // default to veg if invalid
    }

    const response = await getClient().chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [
        { role: "system", content: "You are a nutrition expert." },
        {
          role: "user",
          content: `Suggest a daily meal plan (breakfast, lunch, dinner, snacks)
          for a calorie goal of ${dailyCalories} kcal. Meals should be ${preference}.${customPrompt ? ` Additional requirements: ${customPrompt}` : ''}`,
        },
      ],
    });

    const suggestion = response.choices[0].message.content;

    console.log("DeepSeek Response received");
    console.log("Suggestion generated:", suggestion.substring(0, 100) + "...");

    // Save in DB
    // Use user id if authenticated, else use null
    const userId = req.user && req.user.id ? req.user.id : null;

    const saved = await AISuggestion.create({
      user: userId,
      dailyCalories,
      preference,
      suggestion,
    });

    res.json(saved);
  } catch (err) {
    console.error("AI Controller Error:", err);
    if (err.response) {
      console.error("DeepSeek API response error:", err.response.status, err.response.data);
    }
    res.status(500).json({ error: err.message });
  }
};

// Calculate calories burned based on exercise and reps
export const calculateCaloriesBurned = async (req, res) => {
  try {
    const { exercise, reps } = req.body;
    if (!exercise || !reps || reps <= 0) {
      return res.status(400).json({ error: "Exercise and positive reps are required" });
    }

    const prompt = `Calculate the estimated calories burned for doing ${reps} repetitions of ${exercise}. Provide only the number in kcal.`;

    const response = await getClient().chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [
        { role: "system", content: "You are a fitness expert." },
        { role: "user", content: prompt },
      ],
    });

    const caloriesText = response.choices[0].message.content.trim();
    const calories = parseFloat(caloriesText.match(/[\d\.]+/)[0]);

    if (isNaN(calories)) {
      return res.status(500).json({ error: "Failed to parse calories from AI response" });
    }

    res.json({ caloriesBurned: calories });
  } catch (err) {
    console.error("AI Calories Burned Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Fetch history
export const getHistory = async (req, res) => {
  try {
    const history = await AISuggestion.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
