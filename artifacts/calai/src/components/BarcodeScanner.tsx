import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import { X, Loader2, Scan } from "lucide-react";

interface Props {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const detectedRef = useRef(false);

  const stopScanner = useCallback(() => {
    if (controlsRef.current) {
      try { controlsRef.current.stop(); } catch { /* ignore */ }
      controlsRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startScanner = async () => {
      if (!videoRef.current) return;
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current,
          (result, err) => {
            if (cancelled) return;
            if (result && !detectedRef.current) {
              detectedRef.current = true;
              stopScanner();
              onDetected(result.getText());
            }
            if (err && !(err instanceof NotFoundException)) {
              console.warn("Barcode scan error:", err);
            }
          }
        );
        if (!cancelled) {
          controlsRef.current = controls;
          setStarting(false);
        } else {
          controls.stop();
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("notallowed")) {
            setError("Camera permission denied. Please allow camera access and try again.");
          } else {
            setError("Could not start camera. Try entering the barcode manually.");
          }
          setStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [onDetected, stopScanner]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <p className="text-white font-semibold text-base">Scan Barcode</p>
        <button
          onClick={handleClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Aiming reticle */}
        {!error && (
          <div className="relative z-10 w-72 h-36">
            {/* Corner brackets */}
            {[
              "top-0 left-0 border-t-4 border-l-4 rounded-tl-lg",
              "top-0 right-0 border-t-4 border-r-4 rounded-tr-lg",
              "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg",
              "bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg",
            ].map((cls, i) => (
              <div key={i} className={`absolute w-8 h-8 border-primary ${cls}`} />
            ))}
            {/* Scan line animation */}
            {!starting && (
              <div className="absolute inset-x-2 top-0 h-0.5 bg-primary/80 animate-scan-line" />
            )}
          </div>
        )}

        {/* Loading overlay */}
        {starting && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20 bg-black/60">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-white text-sm">Starting camera…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 px-8 text-center">
            <Scan className="w-12 h-12 text-muted-foreground" />
            <p className="text-white text-sm">{error}</p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold"
            >
              Go Back
            </button>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="px-4 pb-12 pt-5 text-center">
        <p className="text-white/60 text-sm">
          Point the camera at a barcode on packaged food
        </p>
      </div>
    </div>
  );
}
