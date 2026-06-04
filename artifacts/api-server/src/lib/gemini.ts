import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface FoodAnalysis {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  confidence: "high" | "medium" | "low";
  ingredients: string[];
}

export async function analyzeFoodImage(
  imageBase64: string,
  mimeType: string,
  description?: string | null
): Promise<FoodAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const descriptionPart = description
    ? `The user describes it as: "${description}"`
    : "No additional description provided.";

  const prompt = `You are a professional nutritionist and food recognition AI. Analyze this food image and provide accurate nutritional information.

${descriptionPart}

Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "foodName": "specific food name and preparation method",
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fat": <number in grams>,
  "fiber": <number in grams>,
  "servingSize": "description of the estimated serving size",
  "confidence": "<high|medium|low>",
  "ingredients": ["ingredient1", "ingredient2", ...]
}

Rules:
- Be as specific as possible about the food (e.g. "Grilled Chicken Breast with Steamed Broccoli" not just "chicken")
- Estimate calories and macros for the VISIBLE portion in the image
- If the user provided a quantity/description, use that to adjust the estimates
- confidence is "high" if food is clearly identifiable, "medium" if partially obscured or mixed dish, "low" if unclear
- Include all visible main ingredients
- All numeric values must be numbers, not strings
- servingSize should be a human-readable description like "1 cup (240g)" or "2 pieces (~150g)"`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType,
    },
  };

  logger.info({ mimeType, hasDescription: !!description }, "Calling Gemini Vision API");

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();

  logger.info("Gemini response received, parsing JSON");

  // Strip any markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const parsed = JSON.parse(cleaned) as FoodAnalysis;

  // Validate and coerce types
  return {
    foodName: String(parsed.foodName),
    calories: Number(parsed.calories),
    protein: Number(parsed.protein),
    carbs: Number(parsed.carbs),
    fat: Number(parsed.fat),
    fiber: Number(parsed.fiber),
    servingSize: String(parsed.servingSize),
    confidence: ["high", "medium", "low"].includes(parsed.confidence)
      ? parsed.confidence
      : "medium",
    ingredients: Array.isArray(parsed.ingredients)
      ? parsed.ingredients.map(String)
      : [],
  };
}
