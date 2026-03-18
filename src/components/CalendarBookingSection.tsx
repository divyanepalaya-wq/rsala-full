import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, Mic, Lightbulb, Camera } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const addOns = [
  { id: "sound", label: "Sound", icon: Mic, price: "रू 5,000" },
  { id: "light", label: "Light", icon: Lightbulb, price: "रू 5,000" },
  { id: "video", label: "Video", icon: Camera, price: "रू 5,000" },
];

const CalendarBookingSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [eventType, setEventType] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder
    alert(
      `Booking requested!\nDate: ${selectedDate ? format(selectedDate, "PPP") : "Not selected"}\nName: ${name}\nOrg: ${organization}\nEvent: ${eventType}\nAdd-ons: ${selectedAddOns.join(", ") || "None"}`
    );
  };

  return (
    <section id="booking" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <motion.div {...sectionReveal} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">Check Availability</h2>
          <p className="text-muted-foreground text-lg">Select a date and request your booking.</p>
        </motion.div>

        <motion.div {...sectionReveal} className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Calendar */}
          <div>
            <div className="rounded-2xl bg-card shadow-soft p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className={cn("p-3 pointer-events-auto w-full")}
              />
            </div>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg bg-accent p-4 flex items-center gap-3"
              >
                <CalendarIcon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Selected Date</p>
                  <p className="font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full min-h-[44px] rounded-lg border border-input bg-background px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Organization</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-input bg-background px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
                className="w-full min-h-[44px] rounded-lg border border-input bg-background px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select event type</option>
                <option value="concert">Concert</option>
                <option value="book-launch">Book Launch</option>
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
                <option value="corporate">Corporate Event</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Add-ons */}
            <div>
              <label className="block text-sm font-medium mb-3">Technical Add-ons</label>
              <div className="grid grid-cols-3 gap-3">
                {addOns.map(({ id, label, icon: Icon, price }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleAddOn(id)}
                    className={cn(
                      "rounded-lg p-3 text-center transition-colors border",
                      selectedAddOns.includes(id)
                        ? "bg-accent border-primary/30 ring-2 ring-primary/20"
                        : "bg-background border-input hover:bg-accent"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 mx-auto mb-1",
                        selectedAddOns.includes(id) ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <p className="text-xs font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{price}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated active:scale-95"
            >
              Request Booking
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default CalendarBookingSection;
