import { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchExerciseData } from "../redux/slices/workoutSlice";
import api from "../api/axios";
import Message from "../components/Message";

export default function AITrainer() {
  const dispatch = useDispatch();
  const [selectedCriteria, setSelectedCriteria] = useState({
    muscle: "",
    type: "",
    equipment: "",
    difficulty: ""
  });
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  // Exercise criteria options
  const muscleOptions = [
    "abdominals", "abductors", "adductors", "biceps", "calves",
    "chest", "forearms", "glutes", "hamstrings", "lats",
    "lower_back", "middle_back", "neck", "quadriceps", "shoulders", "traps", "triceps"
  ];

  const typeOptions = [
    "cardio", "olympic_weightlifting", "plyometrics", "powerlifting",
    "strength", "stretching", "strongman"
  ];

  const equipmentOptions = [
    "body_only", "machine", "other", "foam_roll", "kettlebells",
    "dumbbell", "cable", "barbell", "bands", "medicine_ball", "exercise_ball", "e_z_curl_bar"
  ];

  const difficultyOptions = ["beginner", "intermediate", "expert"];

  const handleCriteriaChange = (field, value) => {
    setSelectedCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const searchExercises = async () => {
    setLoading(true);
    setExerciseOptions([]);
    setSelectedExercise(null);

    try {
      let allData = [];
      const searchTerms = ["push up", "squat", "bench press", "deadlift", "pull up", "dumbbell", "barbell"];

      // Collect results from multiple search terms
      for (const term of searchTerms) {
        try {
          console.log("Trying search term:", term);
          const result = await dispatch(fetchExerciseData(term)).unwrap();
          if (result && result.length > 0) {
            allData = [...allData, ...result];
            console.log(`Found ${result.length} results with term:`, term);
          }
        } catch (error) {
          console.log("Term failed:", term, error.message);
          continue;
        }
      }

      // Remove duplicates based on exercise name
      const uniqueData = allData.filter((exercise, index, self) =>
        index === self.findIndex(e => e.name === exercise.name)
      );

      console.log("Total unique exercises found:", uniqueData.length);
      console.log("Final API Response:", uniqueData);

      if (uniqueData.length === 0) {
        setMessage("Unable to fetch exercise data. Please check your internet connection and try again.");
        setMessageType("error");
        return;
      }

      // If no specific criteria selected, show all results
      let filteredData = uniqueData;

      // Apply filters with priority - show results even if not all criteria match
      let priorityFiltered = [];
      let secondaryFiltered = [];

      // First priority: exact matches for selected criteria
      if (selectedCriteria.muscle) {
        priorityFiltered = uniqueData.filter(ex => ex.muscle && ex.muscle.toLowerCase().includes(selectedCriteria.muscle.toLowerCase()));
      }
      if (selectedCriteria.type) {
        priorityFiltered = priorityFiltered.length > 0
          ? priorityFiltered.filter(ex => ex.type && ex.type.toLowerCase().includes(selectedCriteria.type.toLowerCase()))
          : uniqueData.filter(ex => ex.type && ex.type.toLowerCase().includes(selectedCriteria.type.toLowerCase()));
      }
      if (selectedCriteria.equipment) {
        priorityFiltered = priorityFiltered.length > 0
          ? priorityFiltered.filter(ex => ex.equipment && ex.equipment.toLowerCase().includes(selectedCriteria.equipment.toLowerCase()))
          : uniqueData.filter(ex => ex.equipment && ex.equipment.toLowerCase().includes(selectedCriteria.equipment.toLowerCase()));
      }
      if (selectedCriteria.difficulty) {
        priorityFiltered = priorityFiltered.length > 0
          ? priorityFiltered.filter(ex => ex.difficulty && ex.difficulty.toLowerCase().includes(selectedCriteria.difficulty.toLowerCase()))
          : uniqueData.filter(ex => ex.difficulty && ex.difficulty.toLowerCase().includes(selectedCriteria.difficulty.toLowerCase()));
      }

      // If we have priority matches, use them
      if (priorityFiltered.length > 0) {
        filteredData = priorityFiltered;
      } else {
        // Fallback: show exercises that match at least one criteria
        if (selectedCriteria.muscle) {
          secondaryFiltered = [...secondaryFiltered, ...uniqueData.filter(ex => ex.muscle && ex.muscle.toLowerCase().includes(selectedCriteria.muscle.toLowerCase()))];
        }
        if (selectedCriteria.type) {
          secondaryFiltered = [...secondaryFiltered, ...uniqueData.filter(ex => ex.type && ex.type.toLowerCase().includes(selectedCriteria.type.toLowerCase()))];
        }
        if (selectedCriteria.equipment) {
          secondaryFiltered = [...secondaryFiltered, ...uniqueData.filter(ex => ex.equipment && ex.equipment.toLowerCase().includes(selectedCriteria.equipment.toLowerCase()))];
        }
        if (selectedCriteria.difficulty) {
          secondaryFiltered = [...secondaryFiltered, ...uniqueData.filter(ex => ex.difficulty && ex.difficulty.toLowerCase().includes(selectedCriteria.difficulty.toLowerCase()))];
        }

        // Remove duplicates and show results
        const uniqueExercises = secondaryFiltered.filter((exercise, index, self) =>
          index === self.findIndex(e => e.name === exercise.name)
        );

        filteredData = uniqueExercises.length > 0 ? uniqueExercises : uniqueData.slice(0, 8);
      }

      console.log("Filtered data:", filteredData);

      setExerciseOptions(filteredData.slice(0, 10)); // Show top 10 results
    } catch (err) {
      console.error("Search error:", err);
      setMessage("Failed to fetch exercises: " + err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const selectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mt-20">AI Exercise Trainer</h2>

      <Message message={message} type={messageType} onClose={() => setMessage(null)} />

      {/* Criteria Selection */}
      <div className="bg-gray-50 p-4 rounded-lg shadow max-w-4xl">
        <h3 className="text-lg font-semibold mb-4">Select Your Exercise Criteria</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Muscle Group */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Muscle</label>
            <select
              value={selectedCriteria.muscle}
              onChange={(e) => handleCriteriaChange('muscle', e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Any Muscle</option>
              {muscleOptions.map(muscle => (
                <option key={muscle} value={muscle}>
                  {muscle.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Exercise Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Exercise Type</label>
            <select
              value={selectedCriteria.type}
              onChange={(e) => handleCriteriaChange('type', e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Any Type</option>
              {typeOptions.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-sm font-medium mb-2">Equipment</label>
            <select
              value={selectedCriteria.equipment}
              onChange={(e) => handleCriteriaChange('equipment', e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Any Equipment</option>
              {equipmentOptions.map(equipment => (
                <option key={equipment} value={equipment}>
                  {equipment.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              value={selectedCriteria.difficulty}
              onChange={(e) => handleCriteriaChange('difficulty', e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Any Difficulty</option>
              {difficultyOptions.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={searchExercises}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
        >
          {loading ? "Searching..." : "Find Exercises"}
        </button>
      </div>

      {/* Exercise Options */}
      {exerciseOptions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Available Exercises</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exerciseOptions.map((exercise, index) => (
              <div
                key={index}
                className={`border p-4 rounded cursor-pointer transition-colors ${
                  selectedExercise?.name === exercise.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectExercise(exercise)}
              >
                <h4 className="font-semibold">{exercise.name}</h4>
                <p className="text-sm text-gray-600">Muscle: {exercise.muscle}</p>
                <p className="text-sm text-gray-600">Type: {exercise.type}</p>
                <p className="text-sm text-gray-600">Difficulty: {exercise.difficulty}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Exercise Details */}
      {selectedExercise && (
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Selected Exercise Details</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> {selectedExercise.name}</p>
            <p><strong>Type:</strong> {selectedExercise.type}</p>
            <p><strong>Muscle:</strong> {selectedExercise.muscle}</p>
            <p><strong>Equipment:</strong> {selectedExercise.equipment}</p>
            <p><strong>Difficulty:</strong> {selectedExercise.difficulty}</p>
            <div>
              <strong>Instructions:</strong>
              <p className="mt-1 text-sm">{selectedExercise.instructions}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
