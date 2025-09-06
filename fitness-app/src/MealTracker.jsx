import React, { useState } from "react";
import api from "./api/axios";

export default function MealTracker() {
  const [mealQuery, setMealQuery] = useState("");
  const [nutrition, setNutrition] = useState(null);
  const [savedMeals, setSavedMeals] = useState([]);

  const analyzeMeal = async () => {
    try {
      const res = await api.post("/nutrition/analyze", { query: mealQuery });
      setNutrition(res.data.foods[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const saveMeal = async () => {
    if (!nutrition) return;
    try {
      const mealData = {
        food_name: nutrition.food_name,
        calories: nutrition.nf_calories,
        protein: nutrition.nf_protein,
        carbs: nutrition.nf_total_carbohydrate,
        fat: nutrition.nf_total_fat,
      };
      const res = await api.post("/meals", mealData);
      setSavedMeals([res.data, ...savedMeals]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Meal Tracker</h2>
      <input
        className="border p-2 w-full mt-2"
        value={mealQuery}
        onChange={(e) => setMealQuery(e.target.value)}
        placeholder="e.g. 1 cup rice"
      />
      <button className="bg-green-500 text-white px-4 py-2 mt-2 rounded" onClick={analyzeMeal}>
        Analyze
      </button>

      {nutrition && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3>{nutrition.food_name}</h3>
          <p>Calories: {nutrition.nf_calories}</p>
          <p>Protein: {nutrition.nf_protein}g</p>
          <p>Carbs: {nutrition.nf_total_carbohydrate}g</p>
          <p>Fat: {nutrition.nf_total_fat}g</p>
          <button className="bg-blue-500 text-white px-4 py-2 mt-2 rounded" onClick={saveMeal}>
            Save Meal
          </button>
        </div>
      )}

      <h3 className="text-lg font-bold mt-6">Saved Meals</h3>
      {savedMeals.map((meal, index) => (
        <div key={index} className="border p-2 mt-2">
          {meal.food_name} - {meal.calories} cal
        </div>
      ))}
    </div>
  );
}

  