import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, Send } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const eventTypes = [
  { value: "concert", label: "Concert" },
  { value: "book-launch", label: "Book Launch" },
  { value: "seminar", label: "Seminar" },
  { value: "workshop", label: "Workshop" },
  { value: "corporate", label: "Corporate Event" },
  { value: "other", label: "Other" },
];

const CalendarBookingSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error("Please select a booking date.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      full_name: name,
      email,
      phone: phone || null,
      event_type: eventType,
      booking_date: format(selectedDate, "yyyy-MM-dd"),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } else {
      toast.success("Booking request submitted!", {
        description: `We'll get back to you about ${format(selectedDate, "MMMM d, yyyy")}.`,
      });
      setName("");
      setEmail("");
      setPhone("");
      setEventType("");
      setSelectedDate(undefined);
    }
  };

  const inputClass =
    "w-full min-h-[44px] rounded-lg border border-input bg-background px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <section id="booking" className="py-24 bg-primary/5">
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
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
          </div>

          {/* Phone & Event Type */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+977 ..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">Select event type</option>
                {eventTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Booking Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal min-h-[44px]",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] rounded-lg bg-primary text-primary-foreground font-medium text-base flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? (
              <span className="animate-pulse">Submitting…</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default CalendarBookingSection;
