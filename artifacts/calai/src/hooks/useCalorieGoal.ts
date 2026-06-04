import { useState, useEffect } from "react";

const STORAGE_KEY = "calai_daily_goal";
const DEFAULT_GOAL = 2000;

export function useCalorieGoal() {
  const [goal, setGoalState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    return isNaN(parsed) || parsed < 100 ? DEFAULT_GOAL : parsed;
  });

  const setGoal = (kcal: number) => {
    const clamped = Math.max(100, Math.min(9999, kcal));
    localStorage.setItem(STORAGE_KEY, String(clamped));
    setGoalState(clamped);
  };

  return { goal, setGoal, defaultGoal: DEFAULT_GOAL };
}
