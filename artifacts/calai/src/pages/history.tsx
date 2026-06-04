import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListFoodLogs,
  useDeleteFoodLog,
  getListFoodLogsQueryKey,
  getGetTodaySummaryQueryKey,
  getGetWeeklySummaryQueryKey,
} from "@workspace/api-client-react";
import { format, parseISO, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Flame, Beef, Wheat, Droplet, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};
const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];

export default function History() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dateStr = selectedDate.toISOString().split("T")[0];

  const { data: logs, isLoading } = useListFoodLogs(
    { date: dateStr },
    { query: { queryKey: getListFoodLogsQueryKey({ date: dateStr }) } }
  );

  const deleteMutation = useDeleteFoodLog({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFoodLogsQueryKey({ date: dateStr }) });
        queryClient.invalidateQueries({ queryKey: getGetTodaySummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWeeklySummaryQueryKey() });
        toast({ title: "Entry removed" });
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = selectedDate.toISOString().split("T")[0] === today.toISOString().split("T")[0];
  const isFuture = selectedDate > today;

  const prevDay = () => setSelectedDate((d) => subDays(d, 1));
  const nextDay = () => {
    if (!isFuture && !isToday) setSelectedDate((d) => addDays(d, 1));
  };

  // Group by meal type
  const grouped: Record<string, typeof logs> = {};
  if (logs) {
    for (const log of logs) {
      if (!grouped[log.mealType]) grouped[log.mealType] = [];
      grouped[log.mealType]!.push(log);
    }
  }

  // Daily totals
  const totals = logs?.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-6 rounded-b-3xl text-primary-foreground">
        <h1 className="text-2xl font-bold mb-4">History</h1>

        {/* Date Navigator */}
        <div className="flex items-center justify-between bg-white/15 rounded-2xl px-3 py-2">
          <button
            data-testid="button-prev-day"
            onClick={prevDay}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="font-semibold">
              {isToday ? "Today" : format(selectedDate, "EEEE")}
            </div>
            <div className="text-xs opacity-80">{format(selectedDate, "MMMM d, yyyy")}</div>
          </div>
          <button
            data-testid="button-next-day"
            onClick={nextDay}
            disabled={isToday}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Daily Summary Bar */}
        {logs && logs.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Daily Totals</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Calories", value: Math.round(totals.calories), unit: "kcal", icon: Flame, color: "text-primary" },
                { label: "Protein", value: Math.round(totals.protein), unit: "g", icon: Beef, color: "text-green-600" },
                { label: "Carbs", value: Math.round(totals.carbs), unit: "g", icon: Wheat, color: "text-orange-500" },
                { label: "Fat", value: Math.round(totals.fat), unit: "g", icon: Droplet, color: "text-blue-500" },
              ].map(({ label, value, unit, icon: Icon, color }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm font-bold">{value}</span>
                  <span className="text-xs text-muted-foreground">{unit}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entries */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse bg-muted rounded-2xl" />
            ))}
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
            <Flame className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">No entries for this day</p>
            <p className="text-muted-foreground/60 text-sm">
              {isToday ? "Scan a meal to get started" : "Nothing was logged on this day"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {MEAL_ORDER.filter((m) => grouped[m]?.length).map((mealType) => (
              <div key={mealType}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {MEAL_LABELS[mealType]}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(grouped[mealType]!.reduce((s, l) => s + l.calories, 0))} kcal
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {grouped[mealType]!.map((log) => (
                    <div
                      key={log.id}
                      data-testid={`card-history-${log.id}`}
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
                          <Flame className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{log.foodName}</p>
                        <p className="text-xs text-muted-foreground">{log.servingSize}</p>
                        <div className="flex gap-3 mt-1.5">
                          <span className="text-xs font-semibold text-primary">{Math.round(log.calories)} kcal</span>
                          <span className="text-xs text-muted-foreground">{Math.round(log.protein)}g P</span>
                          <span className="text-xs text-muted-foreground">{Math.round(log.carbs)}g C</span>
                          <span className="text-xs text-muted-foreground">{Math.round(log.fat)}g F</span>
                        </div>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {format(parseISO(log.loggedAt), "h:mm a")}
                        </p>
                      </div>
                      <button
                        data-testid={`button-delete-history-${log.id}`}
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
  );
}
