import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface SiteSettings {
  reviews_enabled: boolean;
  booking_enabled: boolean;
  instagram_url: string;
  facebook_url: string;
}

const DEFAULTS: SiteSettings = {
  reviews_enabled: true,
  booking_enabled: true,
  instagram_url: "https://www.instagram.com/rsala_nepalaya/",
  facebook_url: "https://www.facebook.com/p/Rsala-by-nepalaya-61572842393500/",
};

const SiteSettingsContext = createContext<SiteSettings>(DEFAULTS);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site"), (snap) => {
      if (snap.exists()) {
        setSettings({ ...DEFAULTS, ...snap.data() } as SiteSettings);
      }
    });
    return () => unsub();
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
