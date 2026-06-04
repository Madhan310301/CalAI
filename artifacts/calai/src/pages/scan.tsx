import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAnalyzeFood,
  useCreateFoodLog,
  useLookupBarcode,
  getListFoodLogsQueryKey,
  getGetTodaySummaryQueryKey,
  getGetWeeklySummaryQueryKey,
} from "@workspace/api-client-react";
import {
  Camera,
  Upload,
  X,
  Loader2,
  CheckCircle,
  ChevronDown,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Leaf,
  Zap,
  Barcode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/compressImage";
import BarcodeScanner from "@/components/BarcodeScanner";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type ScanTab = "photo" | "barcode";

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

// ── Barcode panel ─────────────────────────────────────────────────────────────

interface BarcodeResultPanelProps {
  product: {
    foodName: string;
    barcode: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    perServing: boolean;
  };
  mealType: MealType;
  onMealTypeChange: (m: MealType) => void;
  onLog: () => void;
  onReset: () => void;
  logging: boolean;
  logged: boolean;
}

function BarcodeResultPanel({
  product,
  mealType,
  onMealTypeChange,
  onLog,
  onReset,
  logging,
  logged,
}: BarcodeResultPanelProps) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Product name + barcode */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-start gap-2 mb-1">
          <h2 className="text-lg font-bold flex-1">{product.foodName}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{product.servingSize}</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-mono">
            {product.barcode}
          </span>
        </div>
        {!product.perServing && (
          <p className="text-xs text-orange-600 mt-1">Values are per 100g</p>
        )}
      </div>

      {/* Calorie */}
      <div className="bg-primary rounded-2xl p-4 text-primary-foreground text-center">
        <div className="text-4xl font-bold">{Math.round(product.calories)}</div>
        <div className="text-sm opacity-80 mt-1">calories</div>
      </div>

      {/* Macros grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Protein", value: product.protein, icon: Beef, color: "text-green-600" },
          { label: "Carbs", value: product.carbs, icon: Wheat, color: "text-orange-500" },
          { label: "Fat", value: product.fat, icon: Droplet, color: "text-blue-500" },
          { label: "Fiber", value: product.fiber, icon: Leaf, color: "text-emerald-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-sm font-bold">{Math.round(value)}g</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Meal type */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Meal Type</label>
        <div className="relative">
          <select
            value={mealType}
            onChange={(e) => onMealTypeChange(e.target.value as MealType)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {MEAL_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <button
        onClick={onLog}
        disabled={logging || logged}
        className="w-full py-4 bg-accent text-accent-foreground rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-md disabled:opacity-70 active:scale-95 transition-all duration-200"
      >
        {logged ? (
          <><CheckCircle className="w-5 h-5" /> Logged!</>
        ) : logging ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Logging…</>
        ) : (
          <><CheckCircle className="w-5 h-5" /> Log This Meal</>
        )}
      </button>

      <button
        onClick={onReset}
        className="w-full py-3 border border-border rounded-2xl font-medium text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        Scan Another Barcode
      </button>
    </div>
  );
}

// ── Main Scan page ─────────────────────────────────────────────────────────────

export default function Scan() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ScanTab>("photo");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  // Photo state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [description, setDescription] = useState("");
  const [compressStats, setCompressStats] = useState<{ originalKb: number; compressedKb: number } | null>(null);
  const [compressing, setCompressing] = useState(false);

  // Shared state
  const [mealType, setMealType] = useState<MealType>(getMealTypeForTime());
  const [photoLogged, setPhotoLogged] = useState(false);
  const [barcodeLogged, setBarcodeLogged] = useState(false);

  const analyzeFood = useAnalyzeFood();
  const createFoodLog = useCreateFoodLog();
  const barcodeQuery = useLookupBarcode(scannedCode ?? "", {
    query: { enabled: !!scannedCode, retry: false } as any,
  });

  // ── Photo handlers ──────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    analyzeFood.reset();
    setPhotoLogged(false);
    setCompressStats(null);
    setCompressing(true);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    try {
      const { base64, mimeType: outMime, originalKb, compressedKb } = await compressImage(file);
      setImageBase64(base64);
      setMimeType(outMime);
      setCompressStats({ originalKb, compressedKb });
      setImagePreview(`data:image/jpeg;base64,${base64}`);
      URL.revokeObjectURL(objectUrl);
    } catch {
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
      data: { imageBase64, mimeType, description: description.trim() || null },
    });
  };

  const handlePhotoLog = () => {
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
          invalidateAll();
          setPhotoLogged(true);
          toast({ title: "Meal logged!", description: `${result.foodName} added to your log.` });
          setTimeout(() => setLocation("/"), 1200);
        },
        onError: () => toast({ title: "Failed to log meal", variant: "destructive" }),
      }
    );
  };

  const clearPhoto = () => {
    setImagePreview(null);
    setImageBase64(null);
    setCompressStats(null);
    setCompressing(false);
    analyzeFood.reset();
    setPhotoLogged(false);
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // ── Barcode handlers ────────────────────────────────────────────────────────

  const handleBarcodeDetected = (code: string) => {
    setShowBarcodeScanner(false);
    setScannedCode(code);
    setBarcodeLogged(false);
  };

  const handleBarcodeLog = () => {
    const product = barcodeQuery.data;
    if (!product) return;
    createFoodLog.mutate(
      {
        data: {
          foodName: product.foodName,
          calories: product.calories,
          protein: product.protein,
          carbs: product.carbs,
          fat: product.fat,
          fiber: product.fiber,
          servingSize: product.servingSize,
          mealType,
          imageBase64: null,
          ingredients: [],
        },
      },
      {
        onSuccess: () => {
          invalidateAll();
          setBarcodeLogged(true);
          toast({ title: "Meal logged!", description: `${product.foodName} added to your log.` });
          setTimeout(() => setLocation("/"), 1200);
        },
        onError: () => toast({ title: "Failed to log meal", variant: "destructive" }),
      }
    );
  };

  const resetBarcode = () => {
    setScannedCode(null);
    setBarcodeLogged(false);
  };

  // ── Shared ──────────────────────────────────────────────────────────────────

  const invalidateAll = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    queryClient.invalidateQueries({ queryKey: getListFoodLogsQueryKey({ date: todayStr }) });
    queryClient.invalidateQueries({ queryKey: getGetTodaySummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetWeeklySummaryQueryKey() });
  };

  const photoResult = analyzeFood.data;

  return (
    <>
      {showBarcodeScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="bg-primary px-5 pt-12 pb-4 rounded-b-3xl text-primary-foreground">
          <h1 className="text-2xl font-bold">Scan Food</h1>
          <p className="text-sm opacity-80 mt-1">Photo analysis or barcode lookup</p>

          {/* Tab switcher */}
          <div className="flex mt-4 bg-white/15 rounded-xl p-1 gap-1">
            {(["photo", "barcode"] as ScanTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-primary shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {tab === "photo" ? <Camera className="w-4 h-4" /> : <Barcode className="w-4 h-4" />}
                {tab === "photo" ? "Photo" : "Barcode"}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-5 flex flex-col gap-4">

          {/* ── PHOTO TAB ─────────────────────────────────────────────────────── */}
          {activeTab === "photo" && (
            <>
              {!imagePreview ? (
                <div className="flex flex-col gap-3">
                  <button
                    data-testid="button-camera"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-primary/40 rounded-2xl flex flex-col items-center justify-center gap-3 bg-primary/5 hover:bg-primary/10 transition-colors"
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
                  <img src={imagePreview} alt="Food" className="w-full h-64 object-cover rounded-2xl shadow-md" />
                  <button
                    data-testid="button-clear-image"
                    onClick={clearPhoto}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  {compressing && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-full">
                      <Loader2 className="w-3 h-3 animate-spin" /> Optimizing…
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

              {imagePreview && !photoResult && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Description <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <textarea
                      data-testid="input-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. 2 slices of pizza, large portion…"
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
                      <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing…</>
                    ) : (
                      <><Flame className="w-5 h-5" /> Analyze Calories</>
                    )}
                  </button>
                </>
              )}

              {analyzeFood.isError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-sm text-destructive">
                  Analysis failed. Please try again with a clearer photo.
                </div>
              )}

              {photoResult && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="text-lg font-bold flex-1">{photoResult.foodName}</h2>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize shrink-0 ${CONFIDENCE_COLOR[photoResult.confidence]}`}>
                        {photoResult.confidence}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{photoResult.servingSize}</p>
                  </div>

                  <div className="bg-primary rounded-2xl p-4 text-primary-foreground text-center">
                    <div className="text-4xl font-bold">{Math.round(photoResult.calories)}</div>
                    <div className="text-sm opacity-80 mt-1">calories</div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Protein", value: photoResult.protein, icon: Beef, color: "text-green-600" },
                      { label: "Carbs", value: photoResult.carbs, icon: Wheat, color: "text-orange-500" },
                      { label: "Fat", value: photoResult.fat, icon: Droplet, color: "text-blue-500" },
                      { label: "Fiber", value: photoResult.fiber, icon: Leaf, color: "text-emerald-500" },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-sm font-bold">{Math.round(value)}g</span>
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>

                  {photoResult.ingredients.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-4">
                      <h3 className="text-sm font-semibold mb-2">Ingredients</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {photoResult.ingredients.map((ing) => (
                          <span key={ing} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{ing}</span>
                        ))}
                      </div>
                    </div>
                  )}

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

                  <button
                    data-testid="button-log-meal"
                    onClick={handlePhotoLog}
                    disabled={createFoodLog.isPending || photoLogged}
                    className="w-full py-4 bg-accent text-accent-foreground rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-md disabled:opacity-70 active:scale-95 transition-all duration-200"
                  >
                    {photoLogged ? (
                      <><CheckCircle className="w-5 h-5" /> Logged!</>
                    ) : createFoodLog.isPending ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Logging…</>
                    ) : (
                      <><CheckCircle className="w-5 h-5" /> Log This Meal</>
                    )}
                  </button>

                  <button
                    data-testid="button-scan-another"
                    onClick={clearPhoto}
                    className="w-full py-3 border border-border rounded-2xl font-medium text-sm text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Scan Another Food
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── BARCODE TAB ───────────────────────────────────────────────────── */}
          {activeTab === "barcode" && (
            <>
              {!scannedCode && (
                <div className="flex flex-col gap-3">
                  <button
                    data-testid="button-open-barcode-scanner"
                    onClick={() => setShowBarcodeScanner(true)}
                    className="w-full h-48 border-2 border-dashed border-primary/40 rounded-2xl flex flex-col items-center justify-center gap-3 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-md">
                      <Barcode className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-semibold text-primary">Open Scanner</span>
                    <span className="text-xs text-muted-foreground">Point camera at product barcode</span>
                  </button>

                  <div className="bg-muted/50 rounded-2xl p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Supports EAN-13, UPC-A, and most grocery product barcodes.
                      Data from Open Food Facts.
                    </p>
                  </div>
                </div>
              )}

              {scannedCode && barcodeQuery.isLoading && (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Looking up barcode <span className="font-mono font-medium">{scannedCode}</span>…</p>
                </div>
              )}

              {scannedCode && barcodeQuery.isError && (
                <div className="flex flex-col gap-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-sm text-destructive">
                    Product not found in the Open Food Facts database.
                  </div>
                  <button
                    onClick={resetBarcode}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-3"
                  >
                    <Barcode className="w-5 h-5" /> Try Another Barcode
                  </button>
                </div>
              )}

              {scannedCode && barcodeQuery.data && (
                <BarcodeResultPanel
                  product={barcodeQuery.data}
                  mealType={mealType}
                  onMealTypeChange={setMealType}
                  onLog={handleBarcodeLog}
                  onReset={resetBarcode}
                  logging={createFoodLog.isPending}
                  logged={barcodeLogged}
                />
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}
