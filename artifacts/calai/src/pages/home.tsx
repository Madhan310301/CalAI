import { useLocation } from "wouter";
import { useGetTodaySummary, useGetWeeklySummary, useGetStreak, useListFoodLogs, getListFoodLogsQueryKey, useDeleteFoodLog, getGetTodaySummaryQueryKey, getGetWeeklySummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Camera, Trash2, Flame, Beef, Wheat, Droplet, Zap } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useCalorieGoal } from "@/hooks/useCalorieGoal";
import GoalSettingsDialog from "@/components/GoalSettingsDialog";
const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};
const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];

function MacroRing({
  value,
  max,
  color,
  label,
  unit = "g",
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  unit?: string;
}) {
  const pct = Math.min(value / max, 1);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split("T")[0];

  const { data: summary, isLoading: summaryLoading } = useGetTodaySummary();
  const { data: weekly, isLoading: weeklyLoading } = useGetWeeklySummary();
  const { data: streak } = useGetStreak();
  const { data: logs, isLoading: logsLoading } = useListFoodLogs(
    { date: todayStr },
    { query: { queryKey: getListFoodLogsQueryKey({ date: todayStr }) } }
  );
  const deleteMutation = useDeleteFoodLog({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFoodLogsQueryKey({ date: todayStr }) });
        queryClient.invalidateQueries({ queryKey: getGetTodaySummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWeeklySummaryQueryKey() });
        toast({ title: "Entry removed" });
      },
    },
  });

  const { goal, setGoal } = useCalorieGoal();
  const cal = summary?.totalCalories ?? 0;
  const pct = Math.min(cal / goal, 1);
  const circumference = 2 * Math.PI * 56;

  // Group logs by meal type
  const grouped: Record<string, typeof logs> = {};
  if (logs) {
    for (const log of logs) {
      if (!grouped[log.mealType]) grouped[log.mealType] = [];
      grouped[log.mealType]!.push(log);
    }
  }

  const weeklyData = weekly?.map((d) => ({
    day: format(parseISO(d.date), "EEE"),
    calories: Math.round(d.totalCalories),
    date: d.date,
  })) ?? [];

  const today = todayStr;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-8 rounded-b-3xl text-primary-foreground">
        <div className="mb-1 text-sm font-medium opacity-80">{format(new Date(), "EEEE, MMMM d")}</div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Daily Summary</h1>
          <GoalSettingsDialog currentGoal={goal} onSave={setGoal} />
        </div>

        {/* Calorie Ring */}
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="white"
                strokeWidth="10"
                strokeDasharray={`${pct * circumference} ${circumference}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame className="w-4 h-4 mb-1 opacity-80" />
              <span className="text-2xl font-bold leading-none">{summaryLoading ? "—" : Math.round(cal)}</span>
              <span className="text-xs opacity-70">/ {goal} kcal</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-3">
              <div className="flex justify-between text-xs opacity-80 mb-1">
                <span>{Math.round(cal)} eaten</span>
                <span>{Math.max(0, goal - Math.round(cal))} remaining</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            </div>
            <div className="text-sm opacity-80">
              {summary?.entryCount ?? 0} {summary?.entryCount === 1 ? "entry" : "entries"} today
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-6">
        {/* Macro Rings */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Macros</h2>
          <div className="flex justify-around">
            <MacroRing value={summary?.totalProtein ?? 0} max={150} color="hsl(var(--chart-1))" label="Protein" />
            <MacroRing value={summary?.totalCarbs ?? 0} max={250} color="hsl(var(--chart-2))" label="Carbs" />
            <MacroRing value={summary?.totalFat ?? 0} max={65} color="hsl(var(--chart-3))" label="Fat" />
            <MacroRing value={summary?.totalFiber ?? 0} max={30} color="hsl(var(--chart-4))" label="Fiber" />
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
            <Zap className="w-7 h-7 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Current Streak</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-accent">{streak?.currentStreak ?? 0}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {streak?.currentStreak === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground mb-0.5">Best</p>
            <p className="text-lg font-bold">{streak?.longestStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">This Week</h2>
          {weeklyLoading ? (
            <div className="h-28 animate-pulse bg-muted rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={112}>
              <BarChart data={weeklyData} barSize={24} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
                  formatter={(v: number) => [`${v} kcal`, "Calories"]}
                />
                <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((d) => (
                    <Cell
                      key={d.date}
                      fill={d.date === today ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Scan CTA */}
        <button
          data-testid="button-scan-food"
          onClick={() => setLocation("/scan")}
          className="w-full py-4 bg-accent text-accent-foreground rounded-2xl font-semibold text-base flex items-center justify-center gap-3 shadow-md active:scale-95 transition-all duration-200 hover:opacity-90"
        >
          <Camera className="w-5 h-5" />
          Scan Food
        </button>

        {/* Today's Logs */}
        <div>
          <h2 className="text-base font-semibold mb-3">Today's Food</h2>
          {logsLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse bg-muted rounded-2xl" />
              ))}
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
              <Flame className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No food logged yet today.</p>
              <button
                onClick={() => setLocation("/scan")}
                className="text-primary text-sm font-medium"
              >
                Scan your first meal
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {MEAL_ORDER.filter((m) => grouped[m]?.length).map((mealType) => (
                <div key={mealType}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    {MEAL_LABELS[mealType]}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {grouped[mealType]!.map((log) => (
                      <div
                        key={log.id}
                        data-testid={`card-log-${log.id}`}
                        className="bg-card border border-border rounded-2xl p-3 flex gap-3 items-center"
                      >
                        {log.imageBase64 ? (
                          <img
                            src={`data:image/jpeg;base64,${log.imageBase64}`}
                            alt={log.foodName}
                            className="w-14 h-14 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <Flame className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{log.foodName}</p>
                          <p className="text-xs text-muted-foreground">{log.servingSize}</p>
                          <div className="flex gap-3 mt-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-primary flex items-center gap-1">
                              <Flame className="w-3 h-3" />{Math.round(log.calories)} kcal
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Beef className="w-3 h-3" />{Math.round(log.protein)}g
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Wheat className="w-3 h-3" />{Math.round(log.carbs)}g
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Droplet className="w-3 h-3" />{Math.round(log.fat)}g
                            </span>
                          </div>
                        </div>
                        <button
                          data-testid={`button-delete-${log.id}`}
                          onClick={() => deleteMutation.mutate({ id: log.id })}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-xl shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
