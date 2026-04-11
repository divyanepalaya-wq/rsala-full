export interface PricingSettings {
  hall_4hrs: number;
  hall_8hrs: number;
  sound: number;
  light: number;
  sound_light_additional: number;
  video_technical: number;
  video_production: number;
  generator_backup: number;
  valet: number;
  venue_assistance: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  span?: boolean;
  storagePath?: string; // Firebase Storage path for deletion
}

export interface SiteContent {
  hero_subtitle: string;
  about_text: string;
}
