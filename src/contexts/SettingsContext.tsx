import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PricingSettings, GalleryImage, SiteContent } from "@/types/settings";

export const DEFAULT_PRICES: PricingSettings = {
  hall_4hrs: 15000,
  hall_8hrs: 25000,
  sound: 5000,
  light: 5000,
  sound_light_additional: 15000,
  video_technical: 5000,
  video_production: 20000,
  generator_backup: 2000,
  valet: 1500,
  venue_assistance: 1500,
};

export const DEFAULT_GALLERY: GalleryImage[] = [
  { id: "paleti-session", url: "/gallery/paleti-session.jpg", alt: "Paleti music session at r-sala", span: true },
  { id: "auditorium-side", url: "/gallery/auditorium-side.jpg", alt: "r-sala auditorium stage and lighting" },
  { id: "IMG_0515", url: "/gallery/IMG_0515.jpg", alt: "r-sala venue photo 1" },
  { id: "IMG_0812", url: "/gallery/IMG_0812.jpg", alt: "r-sala venue photo 2" },
  { id: "IMG_4215", url: "/gallery/IMG_4215.jpg", alt: "r-sala venue photo 3" },
  { id: "IMG_4675", url: "/gallery/IMG_4675.jpg", alt: "r-sala venue photo 4" },
  { id: "IMG_8265", url: "/gallery/IMG_8265.jpg", alt: "r-sala venue photo 5" },
];

export const DEFAULT_CONTENT: SiteContent = {
  hero_subtitle: "Kathmandu's premier 70-pax intimate auditorium, managed by Nepa-laya.",
  about_text:
    "r-sala is the heart of acoustic excellence and the home of the Paleti music series. Curated by Nepa-laya, we offer a professional, tiered-seating environment for concerts, book launches, and seminars.",
};

interface SettingsContextValue {
  pricing: PricingSettings;
  gallery: GalleryImage[];
  content: SiteContent;
}

const SettingsContext = createContext<SettingsContextValue>({
  pricing: DEFAULT_PRICES,
  gallery: DEFAULT_GALLERY,
  content: DEFAULT_CONTENT,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [pricing, setPricing] = useState<PricingSettings>(DEFAULT_PRICES);
  const [gallery, setGallery] = useState<GalleryImage[]>(DEFAULT_GALLERY);
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    const unsubPricing = onSnapshot(doc(db, "settings", "pricing"), (snap) => {
      if (snap.exists()) setPricing({ ...DEFAULT_PRICES, ...(snap.data() as PricingSettings) });
    });

    const unsubGallery = onSnapshot(doc(db, "settings", "gallery"), (snap) => {
      const images = snap.data()?.images;
      if (Array.isArray(images) && images.length > 0) setGallery(images as GalleryImage[]);
    });

    const unsubContent = onSnapshot(doc(db, "settings", "content"), (snap) => {
      if (snap.exists()) setContent({ ...DEFAULT_CONTENT, ...(snap.data() as SiteContent) });
    });

    return () => { unsubPricing(); unsubGallery(); unsubContent(); };
  }, []);

  return (
    <SettingsContext.Provider value={{ pricing, gallery, content }}>
      {children}
    </SettingsContext.Provider>
  );
};
