import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || "AIzaSyA53MkL76L06DNi24Ug5zCsxSR7VAsuauY";

console.log("GOOGLE_AI_API_KEY:", GOOGLE_AI_API_KEY ? "Set" : "Not set");

if (!GOOGLE_AI_API_KEY) {
  throw new Error("Google AI API key is not set. Please set GOOGLE_AI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Mock food data for common items when API is unavailable
const mockFoodData = {
  "apple": {
    food_name: "apple",
    nf_calories: 95,
    nf_protein: 0.5,
    nf_total_fat: 0.3,
    nf_total_carbohydrate: 25.1
  },
  "banana": {
    food_name: "banana",
    nf_calories: 105,
    nf_protein: 1.3,
    nf_total_fat: 0.4,
    nf_total_carbohydrate: 27.0
  },
  "chicken breast": {
    food_name: "chicken breast",
    nf_calories: 165,
    nf_protein: 31.0,
    nf_total_fat: 3.6,
    nf_total_carbohydrate: 0.0
  },
  "rice": {
    food_name: "rice",
    nf_calories: 130,
    nf_protein: 2.7,
    nf_total_fat: 0.3,
    nf_total_carbohydrate: 28.0
  },
  "bread": {
    food_name: "bread",
    nf_calories: 79,
    nf_protein: 2.7,
    nf_total_fat: 1.0,
    nf_total_carbohydrate: 14.0
  },
  "egg": {
    food_name: "egg",
    nf_calories: 70,
    nf_protein: 6.0,
    nf_total_fat: 5.0,
    nf_total_carbohydrate: 0.6
  },
  "paneer": {
    food_name: "paneer",
    nf_calories: 260,
    nf_protein: 18.0,
    nf_total_fat: 20.0,
    nf_total_carbohydrate: 3.0
  }
};

export const getFoodData = async (query) => {
  try {
    const prompt = `Provide accurate nutritional information for the specified quantity of "${query}" based on standard USDA or reliable nutritional databases. If a quantity is specified (like 100g, 1 cup, 2 pieces), use that exact amount. Otherwise use a typical serving size. Return only the JSON object in this exact format, no additional text: {"food_name": "${query}", "nf_calories": number, "nf_protein": number, "nf_total_fat": number, "nf_total_carbohydrate": number}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Remove any markdown formatting if present
    const cleanedText = text.replace(/```json\n?|\n?```/g, '');

    const data = JSON.parse(cleanedText);

    // Validate the response has required fields
    if (!data.food_name || typeof data.nf_calories !== 'number' || typeof data.nf_protein !== 'number' || typeof data.nf_total_fat !== 'number' || typeof data.nf_total_carbohydrate !== 'number') {
      throw new Error("Invalid response format from Gemini API");
    }

    return { foods: [data] };
  } catch (error) {
    console.error("Gemini API Error:", error.message);

    // Fallback to mock data for common foods
    const queryLower = query.toLowerCase();
    for (const [key, mockData] of Object.entries(mockFoodData)) {
      if (queryLower.includes(key)) {
        console.log(`Using mock data for: ${key}`);
        return { foods: [mockData] };
      }
    }

    // If no mock data matches, provide a generic fallback
    console.log(`Using generic fallback for: ${query}`);
    return {
      foods: [{
        food_name: query,
        nf_calories: 100, // Default calories
        nf_protein: 5,
        nf_total_fat: 2,
        nf_total_carbohydrate: 15
      }]
    };
  }
};
