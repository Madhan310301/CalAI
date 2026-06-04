import { useState } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  currentGoal: number;
  onSave: (goal: number) => void;
}

const PRESETS = [1500, 1800, 2000, 2200, 2500, 3000];

export default function GoalSettingsDialog({ currentGoal, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(currentGoal));
  const [error, setError] = useState("");

  const handleOpen = (o: boolean) => {
    if (o) setValue(String(currentGoal));
    setError("");
    setOpen(o);
  };

  const handleSave = () => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 100 || num > 9999) {
      setError("Enter a number between 100 and 9999");
      return;
    }
    onSave(num);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button
          data-testid="button-settings"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Daily Calorie Goal</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Presets */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quick presets</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  data-testid={`preset-${p}`}
                  onClick={() => setValue(String(p))}
                  className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                    value === String(p)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-transparent hover:border-primary/30"
                  }`}
                >
                  {p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <p className="text-sm text-muted-foreground mb-1.5">Custom amount (kcal)</p>
            <input
              data-testid="input-goal"
              type="number"
              min={100}
              max={9999}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. 2000"
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>

          <Button
            data-testid="button-save-goal"
            onClick={handleSave}
            className="w-full rounded-xl font-semibold py-5"
          >
            Save Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
