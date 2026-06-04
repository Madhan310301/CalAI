import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAnalyzeFood,
  useCreateFoodLog,
  getListFoodLogsQueryKey,
  getGetTodaySummaryQueryKey,
  getGetWeeklySummaryQueryKey,
} from "@workspace/api-client-react";
import { Camera, Upload, X, Loader2, CheckCircle, ChevronDown, Flame, Beef, Wheat, Droplet, Leaf, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/compressImage";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

const CONFIDENCE_COLOR: Record<string, string> = {
  high: "text-green-600 bg-green-50",
  medium: "text-orange-600 bg-orange-50",
  low: "text-red-600 bg-red-50",
};

function getMealTypeForTime(): MealType {
  const h = new Date().getHours();
  if (h < 10) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 20) return "dinner";
  return "snack";
}

export default function Scan() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>(getMealTypeForTime());
  const [logged, setLogged] = useState(false);
  const [compressStats, setCompressStats] = useState<{ originalKb: number; compressedKb: number } | null>(null);
  const [compressing, setCompressing] = useState(false);

  const analyzeFood = useAnalyzeFood();
  const createFoodLog = useCreateFoodLog();

  const processFile = useCallback(async (file: File) => {
    analyzeFood.reset();
    setLogged(false);
    setCompressStats(null);
    setCompressing(true);

    // Show instant preview from original file while compressing
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    try {
      const { base64, mimeType: outMime, originalKb, compressedKb } = await compressImage(file);
      setImageBase64(base64);
      setMimeType(outMime);
      setCompressStats({ originalKb, compressedKb });
      // Replace preview with compressed JPEG for consistency
      setImagePreview(`data:image/jpeg;base64,${base64}`);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: use original file via FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImagePreview(dataUrl);
        setImageBase64(dataUrl.split(",")[1] ?? null);
        setMimeType(file.type || "image/jpeg");
        URL.revokeObjectURL(objectUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  }, [analyzeFood]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleAnalyze = () => {
    if (!imageBase64) return;
    analyzeFood.mutate({
      data: {
        imageBase64,
        mimeType,
        description: description.trim() || null,
      },
    });
  };

  const handleLog = () => {
    const result = analyzeFood.data;
    if (!result) return;
    createFoodLog.mutate(
      {
        data: {
          foodName: result.foodName,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          fiber: result.fiber,
          servingSize: result.servingSize,
          mealType,
          imageBase64: imageBase64 ?? null,
          ingredients: result.ingredients,
        },
      },
      {
        onSuccess: () => {
          const todayStr = new Date().toISOString().split("T")[0];
          queryClient.invalidateQueries({ queryKey: getListFoodLogsQueryKey({ date: todayStr }) });
          queryClient.invalidateQueries({ queryKey: getGetTodaySummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetWeeklySummaryQueryKey() });
          setLogged(true);
          toast({ title: "Meal logged!", description: `${result.foodName} added to your log.` });
          setTimeout(() => setLocation("/"), 1200);
        },
        onError: () => {
          toast({ title: "Failed to log meal", variant: "destructive" });
        },
      }
    );
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setCompressStats(null);
    setCompressing(false);
    analyzeFood.reset();
    setLogged(false);
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const result = analyzeFood.data;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-6 rounded-b-3xl text-primary-foreground">
        <h1 className="text-2xl font-bold">Scan Food</h1>
        <p className="text-sm opacity-80 mt-1">Take a photo to get instant nutrition info</p>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Image Upload Area */}
        {!imagePreview ? (
          <div className="flex flex-col gap-3">
            <button
              data-testid="button-camera"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-primary/40 rounded-2xl flex flex-col items-center justify-center gap-3 bg-primary/5 hover:bg-primary/10 transition-colors active:scale-98"
            >
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-md">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <span className="font-semibold text-primary">Take a Photo</span>
              <span className="text-xs text-muted-foreground">Point your camera at food</span>
            </button>
            <button
              data-testid="button-upload"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border border-border rounded-2xl flex items-center justify-center gap-3 bg-card hover:bg-muted transition-colors"
            >
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-sm">Upload from Gallery</span>
            </button>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Food"
              className="w-full h-64 object-cover rounded-2xl shadow-md"
            />
            <button
              data-testid="button-clear-image"
              onClick={clearImage}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {/* Compression badge */}
            {compressing && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                Optimizing…
              </div>
            )}
            {compressStats && !compressing && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-full">
                <Zap className="w-3 h-3 text-yellow-400" />
                {compressStats.originalKb > compressStats.compressedKb
                  ? `${compressStats.originalKb} KB → ${compressStats.compressedKb} KB`
                  : `${compressStats.compressedKb} KB`}
              </div>
            )}
          </div>
        )}

        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        {/* Description */}
        {imagePreview && !result && (
          <>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                data-testid="input-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 2 slices of pizza, large portion of rice and chicken..."
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                rows={3}
              />
            </div>

            <button
              data-testid="button-analyze"
              onClick={handleAnalyze}
              disabled={analyzeFood.isPending || !imageBase64}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-md disabled:opacity-70 active:scale-95 transition-all duration-200"
            >
              {analyzeFood.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5" />
                  Analyze Calories
                </>
              )}
            </button>
          </>
        )}

        {/* Error */}
        {analyzeFood.isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-sm text-destructive">
            Analysis failed. Please try again with a clearer photo.
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Food Name + Confidence */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-lg font-bold flex-1" data-testid="text-food-name">{result.foodName}</h2>
                <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize shrink-0 ${CONFIDENCE_COLOR[result.confidence]}`}>
                  {result.confidence}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{result.servingSize}</p>
            </div>

            {/* Calorie Big Number */}
            <div className="bg-primary rounded-2xl p-4 text-primary-foreground text-center">
              <div className="text-4xl font-bold">{Math.round(result.calories)}</div>
              <div className="text-sm opacity-80 mt-1">calories</div>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Protein", value: result.protein, icon: Beef, color: "text-green-600" },
                { label: "Carbs", value: result.carbs, icon: Wheat, color: "text-orange-500" },
                { label: "Fat", value: result.fat, icon: Droplet, color: "text-blue-500" },
                { label: "Fiber", value: result.fiber, icon: Leaf, color: "text-emerald-500" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm font-bold">{Math.round(value)}g</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Ingredients */}
            {result.ingredients.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="text-sm font-semibold mb-2">Ingredients</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.ingredients.map((ing) => (
                    <span key={ing} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meal Type Selector */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Meal Type</label>
              <div className="relative">
                <select
                  data-testid="select-meal-type"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {MEAL_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Log Button */}
            <button
              data-testid="button-log-meal"
              onClick={handleLog}
              disabled={createFoodLog.isPending || logged}
              className="w-full py-4 bg-accent text-accent-foreground rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-md disabled:opacity-70 active:scale-95 transition-all duration-200"
            >
              {logged ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Logged!
                </>
              ) : createFoodLog.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Log This Meal
                </>
              )}
            </button>

            {/* Scan Another */}
            <button
              data-testid="button-scan-another"
              onClick={clearImage}
              className="w-full py-3 border border-border rounded-2xl font-medium text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Scan Another Food
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
