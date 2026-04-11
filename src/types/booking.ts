import type { Timestamp } from "firebase/firestore";

export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled" | "deleted";
export type BookingType = "online" | "manual";
export type PaymentMethod = "cash" | "bank_transfer" | "esewa" | "khalti" | "fonepay" | "cheque";
export type PaymentStatus = "unpaid" | "partial" | "paid";

export interface BookingServices {
  hall_duration: "4hrs" | "8hrs";
  sound: boolean;
  light: boolean;
  sound_light_additional: boolean;
  video_technical: boolean;
  video_production: boolean;
  generator_backup: boolean;
  generator_hours: number;
  valet: boolean;
  venue_assistance: boolean;
}

export interface Booking {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  event_type: string;
  booking_date: string; // "YYYY-MM-DD"
  status: BookingStatus;
  is_manual: boolean;
  booking_type: BookingType;
  notes: string;
  created_at: Timestamp | null;
  // Services & cost (optional for backward-compat with old bookings)
  selected_services?: BookingServices;
  estimated_cost?: number;
  // Payment (admin-filled)
  payment_amount?: number | null;
  payment_method?: PaymentMethod | null;
  payment_notes?: string;
  // Soft delete
  deletion_note?: string;
  deleted_at?: Timestamp | null;
}
