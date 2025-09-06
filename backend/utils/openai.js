import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

let genAI;
let model;

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Please add it to your .env file.");
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
  return model;
};

export const analyzeFoodImage = async (filePath) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const imageBase64 = imageBuffer.toString('base64');

    const model = getModel();

    const result = await model.generateContent([
      "You are a nutrition assistant. Identify the food in this image and provide a brief description.",
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze food image: " + error.message);
  }
};
