import { format, getDaysInMonth } from "date-fns";
import type { Booking, BookingServices } from "@/types/booking";

// ─── Paleti Series Date Logic ─────────────────────────────────────────────────

/**
 * Returns YYYY-MM-DD strings for the last Friday AND last Saturday of the given month.
 * These are always reserved for the Paleti Series.
 */
export function getPaletiDates(year: number, month: number): string[] {
  const days = getDaysInMonth(new Date(year, month - 1));
  let lastFriday = -1;
  let lastSaturday = -1;

  for (let d = days; d >= 1; d--) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow === 5 && lastFriday === -1) lastFriday = d;
    if (dow === 6 && lastSaturday === -1) lastSaturday = d;
    if (lastFriday !== -1 && lastSaturday !== -1) break;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const dates: string[] = [];
  if (lastFriday !== -1) dates.push(`${year}-${pad(month)}-${pad(lastFriday)}`);
  if (lastSaturday !== -1) dates.push(`${year}-${pad(month)}-${pad(lastSaturday)}`);
  return dates;
}

/** Returns Paleti dates across a rolling 13-month window from today. */
export function getPaletiDatesForYear(): string[] {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 0; i < 13; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    dates.push(...getPaletiDates(d.getFullYear(), d.getMonth() + 1));
  }
  return dates;
}

/** True if this date should be blocked (Paleti date OR already approved). */
export function isDateBlocked(date: Date, approvedDates: string[]): boolean {
  const str = format(date, "yyyy-MM-dd");
  return approvedDates.includes(str) || getPaletiDatesForYear().includes(str);
}

// ─── Service Pricing ──────────────────────────────────────────────────────────

export const SERVICE_PRICES: Record<string, number> = {
  hall_4hrs: 15000,
  hall_8hrs: 25000,
  sound: 5000,
  light: 5000,
  sound_light_additional: 15000,
  video_technical: 5000,
  video_production: 20000,
  generator_backup: 2000, // per hour
  valet: 1500,
  venue_assistance: 1500,
};

export const SERVICE_LABELS: Record<string, string> = {
  hall_4hrs: "Hall Rental (Upto 4 hrs)",
  hall_8hrs: "Hall Rental (Upto 8 hrs)",
  sound: "Sound Technical",
  light: "Light Technical",
  sound_light_additional: "Additional Sound & Light",
  video_technical: "Video Technical",
  video_production: "Final Video Production (4 PSD Cameras)",
  generator_backup: "Generator Backup",
  valet: "Valet Driver / Parking",
  venue_assistance: "Venue Assistance",
};

export function calculateEstimatedCost(services: BookingServices): number {
  let total = services.hall_duration === "4hrs" ? SERVICE_PRICES.hall_4hrs : SERVICE_PRICES.hall_8hrs;
  if (services.sound) total += SERVICE_PRICES.sound;
  if (services.light) total += SERVICE_PRICES.light;
  if (services.sound_light_additional) total += SERVICE_PRICES.sound_light_additional;
  if (services.video_technical) total += SERVICE_PRICES.video_technical;
  if (services.video_production) total += SERVICE_PRICES.video_production;
  if (services.generator_backup) total += SERVICE_PRICES.generator_backup * (services.generator_hours || 1);
  if (services.valet) total += SERVICE_PRICES.valet;
  if (services.venue_assistance) total += SERVICE_PRICES.venue_assistance;
  return total;
}

/** Returns a human-readable breakdown of selected services with costs. */
export function getServicesBreakdown(services: BookingServices): { label: string; amount: number }[] {
  const lines: { label: string; amount: number }[] = [];
  const hallKey = services.hall_duration === "4hrs" ? "hall_4hrs" : "hall_8hrs";
  lines.push({ label: SERVICE_LABELS[hallKey], amount: SERVICE_PRICES[hallKey] });
  if (services.sound) lines.push({ label: SERVICE_LABELS.sound, amount: SERVICE_PRICES.sound });
  if (services.light) lines.push({ label: SERVICE_LABELS.light, amount: SERVICE_PRICES.light });
  if (services.sound_light_additional) lines.push({ label: SERVICE_LABELS.sound_light_additional, amount: SERVICE_PRICES.sound_light_additional });
  if (services.video_technical) lines.push({ label: SERVICE_LABELS.video_technical, amount: SERVICE_PRICES.video_technical });
  if (services.video_production) lines.push({ label: SERVICE_LABELS.video_production, amount: SERVICE_PRICES.video_production });
  if (services.generator_backup) lines.push({ label: `Generator Backup (${services.generator_hours || 1} hr${(services.generator_hours || 1) > 1 ? "s" : ""})`, amount: SERVICE_PRICES.generator_backup * (services.generator_hours || 1) });
  if (services.valet) lines.push({ label: SERVICE_LABELS.valet, amount: SERVICE_PRICES.valet });
  if (services.venue_assistance) lines.push({ label: SERVICE_LABELS.venue_assistance, amount: SERVICE_PRICES.venue_assistance });
  return lines;
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function exportToCSV(bookings: Booking[]) {
  const headers = [
    "Date", "Name", "Email", "Phone", "Event Type", "Status",
    "Estimated Cost (NPR)", "Amount Paid (NPR)", "Payment Method",
    "Manual", "Submitted At",
  ];
  const rows = bookings.map((b) => [
    b.booking_date,
    b.full_name,
    b.email,
    b.phone ?? "",
    b.event_type,
    b.status,
    b.estimated_cost != null ? String(b.estimated_cost) : "",
    b.payment_amount != null ? String(b.payment_amount) : "",
    b.payment_method ?? "",
    b.is_manual ? "Yes" : "No",
    b.created_at ? format(b.created_at.toDate(), "yyyy-MM-dd HH:mm") : "",
  ]);

  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `r-sala-bookings-${format(new Date(), "yyyy-MM-dd")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
