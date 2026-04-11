import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, Send, ChevronDown, Minus, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { isDateBlocked, getPaletiDatesForYear, calculateEstimatedCost } from "@/lib/bookingUtils";
import type { BookingServices } from "@/types/booking";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// ─── Validation ───────────────────────────────────────────────────────────────
/** Nepali mobile (96–99) and landline (01x…) formats */
const NEPAL_PHONE_REGEX = /^(\+977[\s-]?)?([9][6-9][0-9]{8}|0[1-9][0-9]{7,8})$/;

const EVENT_TYPES = [
  { value: "concert", label: "Concert" },
  { value: "book-launch", label: "Book Launch" },
  { value: "seminar", label: "Seminar" },
  { value: "workshop", label: "Workshop" },
  { value: "corporate", label: "Corporate Event" },
  { value: "other", label: "Other" },
];

const DEFAULT_SERVICES: BookingServices = {
  hall_duration: "4hrs",
  sound: false, light: false, sound_light_additional: false,
  video_technical: false, video_production: false,
  generator_backup: false, generator_hours: 1,
  valet: false, venue_assistance: false,
};

const ADDONS = [
  { key: "sound" as const,                   label: "Sound Technical",              price: 5000 },
  { key: "light" as const,                   label: "Light Technical",              price: 5000 },
  { key: "sound_light_additional" as const,  label: "Additional Sound & Light",     price: 15000 },
  { key: "video_technical" as const,         label: "Video Technical",              price: 5000 },
  { key: "video_production" as const,        label: "Final Video Production (4 PSD)",price: 20000 },
  { key: "valet" as const,                   label: "Valet Driver / Parking",       price: 1500, note: "upto 4 hrs" },
  { key: "venue_assistance" as const,        label: "Venue Assistance",             price: 1500, note: "upto 4 hrs" },
];

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

// ─── Component ────────────────────────────────────────────────────────────────

const CalendarBookingSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [services, setServices] = useState<BookingServices>(DEFAULT_SERVICES);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [approvedDates, setApprovedDates] = useState<string[]>([]);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const paletiDates = useMemo(() => getPaletiDatesForYear(), []);
  const estimatedCost = useMemo(() => calculateEstimatedCost(services), [services]);

  const phoneError =
    phoneTouched && (!phone.trim() || !NEPAL_PHONE_REGEX.test(phone.trim()))
      ? (!phone.trim() ? "Phone number is required." : "Enter a valid Nepal number (e.g. 9812345678 or +977 98XXXXXXXX)")
      : null;

  const selectedAddonCount = ADDONS.filter((a) => services[a.key]).length +
    (services.generator_backup ? 1 : 0);

  useEffect(() => {
    const q = query(collection(db, "bookings"), where("status", "==", "approved"));
    getDocs(q).then((snap) =>
      setApprovedDates(snap.docs.map((d) => d.data().booking_date as string))
    );
  }, []);

  const setSvc = (key: keyof BookingServices, value: boolean | number | "4hrs" | "8hrs") =>
    setServices((prev) => ({ ...prev, [key]: value }));

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const str = format(date, "yyyy-MM-dd");
    if (approvedDates.includes(str)) { toast.error("This date is already booked."); return; }
    if (paletiDates.includes(str)) { toast.info("Reserved for the Paleti Series."); return; }
    setSelectedDate(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setPhoneTouched(true);
      toast.error("Please enter your phone number.");
      return;
    }
    if (!NEPAL_PHONE_REGEX.test(phone.trim())) {
      setPhoneTouched(true);
      toast.error("Please fix the phone number format.");
      return;
    }
    if (!selectedDate) { toast.error("Please select a booking date."); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "bookings"), {
        full_name: name, email, phone: phone || null, event_type: eventType,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        status: "pending", is_manual: false, notes: "",
        selected_services: services, estimated_cost: estimatedCost,
        payment_amount: null, payment_method: null, payment_notes: "",
        created_at: serverTimestamp(),
      });
      toast.success("Booking request submitted!", {
        description: `We'll confirm your date for ${format(selectedDate, "MMMM d, yyyy")} soon.`,
      });
      setName(""); setEmail(""); setPhone(""); setEventType("");
      setServices(DEFAULT_SERVICES); setSelectedDate(undefined);
      setPhoneTouched(false); setAddonsOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full min-h-[44px] rounded-lg border border-input bg-background px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <section id="booking" className="py-14 md:py-24 bg-primary/5">
      <div className="container mx-auto px-6">
        <motion.div {...sectionReveal} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Reservations
          </span>
          <h2 className="text-3xl md:text-4xl mb-4">Book the Venue</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Fill out the form below and we'll confirm your date as soon as possible.
          </p>
        </motion.div>

        <motion.form
          {...sectionReveal}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto rounded-2xl bg-card shadow-elevated p-8 md:p-10 space-y-6"
        >
          {/* Name & Email */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                required placeholder="Your name" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className={inputClass} />
            </div>
          </div>

          {/* Phone & Event Type */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone *</label>
              <input type="tel" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setPhoneTouched(true)}
                required
                placeholder="9812345678"
                className={cn(inputClass, phoneError && "border-destructive focus:ring-destructive/20")}
              />
              <p className={cn("text-xs mt-1", phoneError ? "text-destructive" : "text-muted-foreground")}>
                {phoneError ?? "Nepal number: 98XXXXXXXX or +977 98XXXXXXXX"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Event Type *</label>
              <select value={eventType} onChange={(e) => setEventType(e.target.value)}
                required className={inputClass}>
                <option value="">Select event type</option>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Booking Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline"
                  className={cn("w-full justify-start text-left font-normal min-h-[44px]", !selectedDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect}
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || isDateBlocked(date, approvedDates)}
                  initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-1.5">
              Grayed-out dates are unavailable or reserved for the Paleti Series.
            </p>
          </div>

          {/* ── Services — compact collapsible ───────────────────────── */}
          <div className="rounded-xl border border-border overflow-hidden">

            {/* Hall Duration — always visible */}
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Hall Rental *
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {(["4hrs", "8hrs"] as const).map((dur) => (
                  <button type="button" key={dur} onClick={() => setSvc("hall_duration", dur)}
                    className={cn(
                      "rounded-lg border-2 p-3.5 text-left transition-all duration-150",
                      services.hall_duration === dur
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 bg-background"
                    )}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={cn("w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        services.hall_duration === dur ? "border-primary" : "border-muted-foreground/30")}>
                        {services.hall_duration === dur && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                      <span className="text-sm font-medium">Upto {dur === "4hrs" ? "4" : "8"} hours</span>
                    </div>
                    <p className="text-lg font-semibold tabular-nums pl-5">
                      रू {dur === "4hrs" ? "15,000" : "25,000"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional add-ons toggle */}
            <button
              type="button"
              onClick={() => setAddonsOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3 border-t border-border text-sm hover:bg-secondary/50 transition-colors"
            >
              <span className="text-muted-foreground">
                {selectedAddonCount > 0
                  ? <span className="text-foreground font-medium">{selectedAddonCount} add-on{selectedAddonCount > 1 ? "s" : ""} selected</span>
                  : "Add additional services"}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", addonsOpen && "rotate-180")} />
            </button>

            {/* Expandable add-ons */}
            <AnimatePresence initial={false}>
              {addonsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-3 border-t border-border space-y-1">
                    {ADDONS.map(({ key, label, price, note }) => (
                      <label key={key}
                        className={cn(
                          "flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-colors",
                          services[key] ? "bg-primary/5" : "hover:bg-secondary/60"
                        )}>
                        <input type="checkbox" checked={!!services[key]}
                          onChange={(e) => setSvc(key, e.target.checked)}
                          className="w-4 h-4 accent-primary rounded shrink-0" />
                        <span className="text-sm flex-1">{label}{note && <span className="text-muted-foreground text-xs ml-1">· {note}</span>}</span>
                        <span className="text-sm text-muted-foreground tabular-nums shrink-0">+रू {price.toLocaleString()}</span>
                      </label>
                    ))}

                    {/* Generator with stepper */}
                    <label className={cn("flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-colors",
                      services.generator_backup ? "bg-primary/5" : "hover:bg-secondary/60")}>
                      <input type="checkbox" checked={services.generator_backup}
                        onChange={(e) => setSvc("generator_backup", e.target.checked)}
                        className="w-4 h-4 accent-primary rounded shrink-0" />
                      <span className="text-sm flex-1">Generator Backup<span className="text-muted-foreground text-xs ml-1">· रू 2,000/hr</span></span>
                      {services.generator_backup ? (
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.preventDefault()}>
                          <button type="button" onClick={() => setSvc("generator_hours", Math.max(1, (services.generator_hours || 1) - 1))}
                            className="w-6 h-6 rounded border border-input flex items-center justify-center hover:bg-secondary transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-sm font-medium tabular-nums">{services.generator_hours || 1}</span>
                          <button type="button" onClick={() => setSvc("generator_hours", (services.generator_hours || 1) + 1)}
                            className="w-6 h-6 rounded border border-input flex items-center justify-center hover:bg-secondary transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-muted-foreground tabular-nums ml-1">
                            = रू {(2000 * (services.generator_hours || 1)).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground tabular-nums shrink-0">+रू 2,000/hr</span>
                      )}
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Estimated cost — always visible */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-primary/5 border-t border-primary/10">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Estimated Cost</p>
                <p className="text-[11px] text-muted-foreground/70">May vary based on final requirements</p>
              </div>
              <p className="text-xl font-semibold tabular-nums text-primary">
                रू {estimatedCost.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting || !!phoneError || !phone.trim()}
            className="w-full min-h-[48px] rounded-lg bg-primary text-primary-foreground font-medium text-base flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none">
            {submitting
              ? <span className="animate-pulse">Submitting…</span>
              : <><Send className="w-4 h-4" />Submit Request</>}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default CalendarBookingSection;
