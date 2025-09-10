// Removed Gemini API integration - now using only mock data for nutrition information

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
  },
  "roti": {
    food_name: "wheat roti",
    nf_calories: 150,
    nf_protein: 4.5,
    nf_total_fat: 2.0,
    nf_total_carbohydrate: 30.0
  }
};

export const getFoodData = async (query) => {
  try {
    // Using only mock data for nutrition information (Gemini API removed)
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
  } catch (error) {
    console.error("Food data error:", error.message);
    return {
      foods: [{
        food_name: query,
        nf_calories: 100,
        nf_protein: 5,
        nf_total_fat: 2,
        nf_total_carbohydrate: 15
      }]
    };
  }
};
