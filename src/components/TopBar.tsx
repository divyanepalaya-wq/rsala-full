import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X } from "lucide-react";
import topbarPattern from "@/assets/topbar.png";

export interface TopBarConfig {
  enabled: boolean;
  message: string;
  button_text: string;
  button_url: string;
}

const TopBar = () => {
  const [config, setConfig] = useState<TopBarConfig | null>(null);
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("rsala-topbar-dismissed") === "true"
  );

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "topbar"), (snap) => {
      if (snap.exists()) setConfig(snap.data() as TopBarConfig);
    });
    return () => unsub();
  }, []);

  if (!config?.enabled || dismissed) return null;

  return (
    <div
      style={{
        backgroundImage: `url(${topbarPattern})`,
        backgroundRepeat: "repeat",
        backgroundSize: "120px 120px",
      }}
      className="relative flex items-center justify-center gap-3 px-10 py-2.5"
    >
      <p className="text-white text-sm font-bold text-center leading-snug">
        {config.message}
      </p>

      {config.button_text && config.button_url && (
        <a
          href={config.button_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-xs font-semibold hover:bg-white/25 transition-colors whitespace-nowrap backdrop-blur-sm"
        >
          {config.button_text}
        </a>
      )}

      <button
        onClick={() => {
          setDismissed(true);
          sessionStorage.setItem("rsala-topbar-dismissed", "true");
        }}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-1 rounded"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default TopBar;
