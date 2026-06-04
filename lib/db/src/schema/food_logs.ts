import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const foodLogsTable = pgTable("food_logs", {
  id: serial("id").primaryKey(),
  foodName: text("food_name").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  fiber: real("fiber").notNull(),
  servingSize: text("serving_size").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  imageBase64: text("image_base64"),
  ingredients: text("ingredients").array().notNull().default([]),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFoodLogSchema = createInsertSchema(foodLogsTable).omit({
  id: true,
  loggedAt: true,
});

export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;
export type FoodLog = typeof foodLogsTable.$inferSelect;
