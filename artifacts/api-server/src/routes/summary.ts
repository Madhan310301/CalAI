import { Router, type IRouter } from "express";
import { gte, lte, and, desc } from "drizzle-orm";
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

router.get("/summary/streak", async (req, res): Promise<void> => {
  // Fetch all distinct logged dates in descending order
  const rows = await db
    .selectDistinct({
      date: sql<string>`DATE(${foodLogsTable.loggedAt} AT TIME ZONE 'UTC')`,
    })
    .from(foodLogsTable)
    .orderBy(desc(sql`DATE(${foodLogsTable.loggedAt} AT TIME ZONE 'UTC')`));

  const dates = rows.map((r) => r.date); // e.g. ["2026-06-04", "2026-06-03", ...]

  if (dates.length === 0) {
    res.json({ currentStreak: 0, longestStreak: 0, lastLoggedDate: null });
    return;
  }

  const lastLoggedDate = dates[0]!;

  // Helper: get YYYY-MM-DD for a date offset from today
  const todayStr = new Date().toISOString().split("T")[0]!;
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0]!;
  })();

  // Current streak: consecutive days ending at today or yesterday
  let currentStreak = 0;
  if (lastLoggedDate === todayStr || lastLoggedDate === yesterdayStr) {
    // Walk backwards from lastLoggedDate
    let expected = lastLoggedDate;
    for (const date of dates) {
      if (date === expected) {
        currentStreak++;
        // Move expected one day earlier
        const prev = new Date(expected + "T12:00:00Z");
        prev.setDate(prev.getDate() - 1);
        expected = prev.toISOString().split("T")[0]!;
      } else {
        break;
      }
    }
  }

  // Longest streak: full scan
  let longestStreak = 0;
  let runLength = 1;
  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i]! + "T12:00:00Z");
    const prev = new Date(dates[i - 1]! + "T12:00:00Z");
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);
    if (diffDays === 1) {
      runLength++;
    } else {
      longestStreak = Math.max(longestStreak, runLength);
      runLength = 1;
    }
  }
  longestStreak = Math.max(longestStreak, runLength);

  res.json({ currentStreak, longestStreak, lastLoggedDate });
});

export default router;
