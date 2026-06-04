import { Router, type IRouter } from "express";
import { gte, lte, and } from "drizzle-orm";
import { db, foodLogsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/summary/today", async (req, res): Promise<void> => {
  const todayStr = new Date().toISOString().split("T")[0];
  const startOfDay = new Date(`${todayStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${todayStr}T23:59:59.999Z`);

  const logs = await db
    .select()
    .from(foodLogsTable)
    .where(
      and(
        gte(foodLogsTable.loggedAt, startOfDay),
        lte(foodLogsTable.loggedAt, endOfDay)
      )
    );

  const summary = logs.reduce(
    (acc, log) => ({
      totalCalories: acc.totalCalories + (log.calories ?? 0),
      totalProtein: acc.totalProtein + (log.protein ?? 0),
      totalCarbs: acc.totalCarbs + (log.carbs ?? 0),
      totalFat: acc.totalFat + (log.fat ?? 0),
      totalFiber: acc.totalFiber + (log.fiber ?? 0),
      entryCount: acc.entryCount + 1,
    }),
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      entryCount: 0,
    }
  );

  res.json({
    date: todayStr,
    ...summary,
  });
});

router.get("/summary/weekly", async (req, res): Promise<void> => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setUTCHours(23, 59, 59, 999);

  const rows = await db
    .select({
      date: sql<string>`DATE(${foodLogsTable.loggedAt} AT TIME ZONE 'UTC')`,
      totalCalories: sql<number>`SUM(${foodLogsTable.calories})`,
      entryCount: sql<number>`COUNT(*)`,
    })
    .from(foodLogsTable)
    .where(
      and(
        gte(foodLogsTable.loggedAt, sevenDaysAgo),
        lte(foodLogsTable.loggedAt, endOfToday)
      )
    )
    .groupBy(sql`DATE(${foodLogsTable.loggedAt} AT TIME ZONE 'UTC')`)
    .orderBy(sql`DATE(${foodLogsTable.loggedAt} AT TIME ZONE 'UTC')`);

  // Fill in missing days with 0
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = rows.find((r) => r.date === dateStr);
    result.push({
      date: dateStr,
      totalCalories: found ? Number(found.totalCalories) : 0,
      entryCount: found ? Number(found.entryCount) : 0,
    });
  }

  res.json(result);
});

export default router;
