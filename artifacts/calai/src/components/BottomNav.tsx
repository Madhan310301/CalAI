import { useLocation } from "wouter";
import { Home, Camera, History } from "lucide-react";

const tabs = [
  { path: "/", label: "Home", icon: Home },
  { path: "/scan", label: "Scan", icon: Camera },
  { path: "/history", label: "History", icon: History },
];

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-50">
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = location === path;
          return (
            <button
              key={path}
              data-testid={`nav-${label.toLowerCase()}`}
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-200 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {path === "/scan" ? (
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                    active
                      ? "bg-primary scale-110"
                      : "bg-primary/90 hover:scale-105"
                  }`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <>
                  <Icon
                    className={`w-6 h-6 transition-all duration-200 ${active ? "scale-110" : ""}`}
                  />
                  <span className="text-xs font-medium">{label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
