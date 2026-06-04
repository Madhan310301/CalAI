import { Router, type IRouter } from "express";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db, foodLogsTable, isDatabaseAvailable } from "@workspace/db";
import {
  CreateFoodLogBody,
  DeleteFoodLogParams,
  ListFoodLogsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/logs", async (req, res): Promise<void> => {
  if (!isDatabaseAvailable()) {
    res.json([]);
    return;
  }

  const queryParsed = ListFoodLogsQueryParams.safeParse(req.query);
  
  // Default to today
  const dateStr = queryParsed.success && queryParsed.data.date
    ? queryParsed.data.date
    : new Date().toISOString().split("T")[0];

  // Parse start/end of the given date in UTC
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  const logs = await db
    .select()
    .from(foodLogsTable)
    .where(
      and(
        gte(foodLogsTable.loggedAt, startOfDay),
        lte(foodLogsTable.loggedAt, endOfDay)
      )
    )
    .orderBy(desc(foodLogsTable.loggedAt));

  res.json(
    logs.map((log) => ({
      ...log,
      ingredients: log.ingredients ?? [],
      loggedAt: log.loggedAt.toISOString(),
    }))
  );
});

router.post("/logs", async (req, res): Promise<void> => {
  if (!isDatabaseAvailable()) {
    res.status(503).json({ error: "Database not configured. Food logging is not available yet." });
    return;
  }

  const parsed = CreateFoodLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [log] = await db
    .insert(foodLogsTable)
    .values({
      foodName: parsed.data.foodName,
      calories: parsed.data.calories,
      protein: parsed.data.protein,
      carbs: parsed.data.carbs,
      fat: parsed.data.fat,
      fiber: parsed.data.fiber,
      servingSize: parsed.data.servingSize,
      mealType: parsed.data.mealType,
      imageBase64: parsed.data.imageBase64 ?? null,
      ingredients: parsed.data.ingredients ?? [],
    })
    .returning();

  res.status(201).json({
    ...log,
    ingredients: log.ingredients ?? [],
    loggedAt: log.loggedAt.toISOString(),
  });
});

router.delete("/logs/:id", async (req, res): Promise<void> => {
  if (!isDatabaseAvailable()) {
    res.status(503).json({ error: "Database not configured." });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramsParsed = DeleteFoodLogParams.safeParse({ id: parseInt(raw, 10) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }

  const [deleted] = await db
    .delete(foodLogsTable)
    .where(eq(foodLogsTable.id, paramsParsed.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Food log entry not found" });
    return;
  }

  res.json({ success: true });
});

export default router;
