import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface OpenFoodFactsResponse {
  status: number;
  product?: {
    product_name?: string;
    brands?: string;
    serving_size?: string;
    serving_quantity?: number;
    nutriments?: {
      "energy-kcal_100g"?: number;
      "energy-kcal_serving"?: number;
      proteins_100g?: number;
      proteins_serving?: number;
      carbohydrates_100g?: number;
      carbohydrates_serving?: number;
      fat_100g?: number;
      fat_serving?: number;
      fiber_100g?: number;
      fiber_serving?: number;
    };
  };
}

router.get("/barcode/:code", async (req, res): Promise<void> => {
  const { code } = req.params;

  if (!code || !/^\d{4,20}$/.test(code)) {
    res.status(400).json({ error: "Invalid barcode format" });
    return;
  }

  let data: OpenFoodFactsResponse;
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`,
      { headers: { "User-Agent": "CalAI/1.0 (calorie tracker app)" } }
    );
    if (!response.ok) {
      res.status(502).json({ error: "Failed to reach food database" });
      return;
    }
    data = await response.json() as OpenFoodFactsResponse;
  } catch {
    res.status(502).json({ error: "Failed to reach food database" });
    return;
  }

  if (data.status !== 1 || !data.product) {
    res.status(404).json({ error: "Product not found in database" });
    return;
  }

  const p = data.product;
  const n = p.nutriments ?? {};

  // Prefer per-serving values if available, fall back to per-100g
  const hasServing = typeof n["energy-kcal_serving"] === "number";
  const calories = hasServing ? (n["energy-kcal_serving"] ?? 0) : (n["energy-kcal_100g"] ?? 0);
  const protein = hasServing ? (n.proteins_serving ?? 0) : (n.proteins_100g ?? 0);
  const carbs = hasServing ? (n.carbohydrates_serving ?? 0) : (n.carbohydrates_100g ?? 0);
  const fat = hasServing ? (n.fat_serving ?? 0) : (n.fat_100g ?? 0);
  const fiber = hasServing ? (n.fiber_serving ?? 0) : (n.fiber_100g ?? 0);

  const servingSize = p.serving_size
    ? p.serving_size
    : hasServing
    ? "1 serving"
    : "100g";

  const brand = p.brands ? ` (${p.brands.split(",")[0]!.trim()})` : "";
  const foodName = `${p.product_name ?? "Unknown product"}${brand}`;

  res.json({
    foodName,
    barcode: code,
    servingSize,
    calories: Math.round(calories * 10) / 10,
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    fiber: Math.round(fiber * 10) / 10,
    perServing: hasServing,
  });
});

export default router;
