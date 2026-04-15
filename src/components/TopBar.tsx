import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X } from "lucide-react";

export interface TopBarConfig {
  enabled: boolean;
  message: string;
  button_text: string;
  button_url: string;
}

// Mandala SVG pattern — subtle white on orange
const MANDALA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <g transform="translate(50,50)" opacity="0.13" fill="white">
    <!-- outer ring -->
    <circle r="46" fill="none" stroke="white" stroke-width="0.7"/>
    <!-- middle ring -->
    <circle r="34" fill="none" stroke="white" stroke-width="0.5"/>
    <!-- inner ring -->
    <circle r="22" fill="none" stroke="white" stroke-width="0.7"/>
    <!-- core ring -->
    <circle r="10" fill="none" stroke="white" stroke-width="0.5"/>
    <!-- center dot -->
    <circle r="2.5" fill="white" opacity="0.6"/>
    <!-- 8 outer petals -->
    <ellipse rx="3" ry="11" transform="rotate(0)   translate(0,-35)" opacity="0.5"/>
    <ellipse rx="3" ry="11" transform="rotate(45)  translate(0,-35)" opacity="0.5"/>
    <ellipse rx="3" ry="11" transform="rotate(90)  translate(0,-35)" opacity="0.5"/>
    <ellipse rx="3" ry="11" transform="rotate(135) translate(0,-35)" opacity="0.5"/>
    <ellipse rx="3" ry="11" transform="rotate(180) translate(0,-35)" opacity="0.5"/>
    <ellipse rx="3" ry="11" transform="rotate(225) translate(0,-35)" opacity="0.5"/>
    <ellipse rx="3" ry="11" transform="rotate(270) translate(0,-35)" opacity="0.5"/>
    <ellipse rx="3" ry="11" transform="rotate(315) translate(0,-35)" opacity="0.5"/>
    <!-- 8 inner petals -->
    <ellipse rx="2" ry="7" transform="rotate(22.5)  translate(0,-22)" opacity="0.4"/>
    <ellipse rx="2" ry="7" transform="rotate(67.5)  translate(0,-22)" opacity="0.4"/>
    <ellipse rx="2" ry="7" transform="rotate(112.5) translate(0,-22)" opacity="0.4"/>
    <ellipse rx="2" ry="7" transform="rotate(157.5) translate(0,-22)" opacity="0.4"/>
    <ellipse rx="2" ry="7" transform="rotate(202.5) translate(0,-22)" opacity="0.4"/>
    <ellipse rx="2" ry="7" transform="rotate(247.5) translate(0,-22)" opacity="0.4"/>
    <ellipse rx="2" ry="7" transform="rotate(292.5) translate(0,-22)" opacity="0.4"/>
    <ellipse rx="2" ry="7" transform="rotate(337.5) translate(0,-22)" opacity="0.4"/>
    <!-- cardinal dots on middle ring -->
    <circle cx="34"  cy="0"   r="2" opacity="0.6"/>
    <circle cx="-34" cy="0"   r="2" opacity="0.6"/>
    <circle cx="0"   cy="34"  r="2" opacity="0.6"/>
    <circle cx="0"   cy="-34" r="2" opacity="0.6"/>
    <!-- diagonal dots -->
    <circle cx="24"  cy="24"  r="1.5" opacity="0.4"/>
    <circle cx="-24" cy="24"  r="1.5" opacity="0.4"/>
    <circle cx="24"  cy="-24" r="1.5" opacity="0.4"/>
    <circle cx="-24" cy="-24" r="1.5" opacity="0.4"/>
    <!-- tiny corner accents -->
    <circle cx="47"  cy="0"   r="1.2" opacity="0.5"/>
    <circle cx="-47" cy="0"   r="1.2" opacity="0.5"/>
    <circle cx="0"   cy="47"  r="1.2" opacity="0.5"/>
    <circle cx="0"   cy="-47" r="1.2" opacity="0.5"/>
  </g>
</svg>`;

const PATTERN_URL = `url("data:image/svg+xml,${encodeURIComponent(MANDALA_SVG)}")`;

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
        backgroundColor: "#C04820",
        backgroundImage: PATTERN_URL,
        backgroundSize: "100px 100px",
      }}
      className="relative flex items-center justify-center gap-3 px-10 py-2.5"
    >
      <p className="text-white text-sm font-medium text-center leading-snug">
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
