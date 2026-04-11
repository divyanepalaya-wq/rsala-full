import { motion } from "framer-motion";
import { Mic, Camera, Lightbulb, Film, Car, Users, Zap, Package } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const fmt = (n: number) => `रू ${n.toLocaleString()}`;

const PricingSection = () => {
  const { pricing } = useSettings();
  return (
    <section id="pricing" className="py-14 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div {...sectionReveal} className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">Pricing</h2>
          <p className="text-muted-foreground text-lg">Transparent pricing for every event need.</p>
        </motion.div>

        {/* Hall Rental */}
        <motion.div {...sectionReveal} className="max-w-4xl mx-auto mb-8 md:mb-12">
          <div className="rounded-2xl p-6 md:p-8 shadow-soft bg-card hover:shadow-elevated transition-shadow">
            <h3 className="text-xl font-semibold mb-1">Hall Rental</h3>
            <p className="text-muted-foreground text-sm mb-5">Max 70 Pax · Tiered Seating</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary p-5">
                <p className="text-muted-foreground text-sm mb-1">Upto 4 hours</p>
                <p className="text-3xl font-semibold tabular-nums">{fmt(pricing.hall_4hrs)}</p>
                <p className="text-xs text-muted-foreground mt-1">Per Show</p>
              </div>
              <div className="rounded-lg bg-secondary p-5">
                <p className="text-muted-foreground text-sm mb-1">Upto 8 hours</p>
                <p className="text-3xl font-semibold tabular-nums">{fmt(pricing.hall_8hrs)}</p>
                <p className="text-xs text-muted-foreground mt-1">Per Show</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technical */}
        <motion.div {...sectionReveal} className="max-w-4xl mx-auto mb-8 md:mb-12">
          <h3 className="text-lg font-semibold mb-6">Technical</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Mic, label: "Sound", price: pricing.sound },
              { icon: Lightbulb, label: "Light", price: pricing.light },
              { icon: Camera, label: "Video", price: pricing.video_technical },
              { icon: Package, label: "Sound & Light Bundle", price: pricing.sound_light_additional, highlight: true },
            ].map(({ icon: Icon, label, price, highlight }) => (
              <div
                key={label}
                className={`rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-shadow ${
                  highlight ? "bg-primary/5 border border-primary/20" : "bg-card"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  highlight ? "bg-primary/10" : "bg-accent"
                }`}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-medium mb-1 text-sm leading-snug">{label}</p>
                <p className="text-2xl font-semibold tabular-nums">{fmt(price)}</p>
                <p className="text-muted-foreground text-xs mt-1">Per Show</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Production & Logistics */}
        <motion.div {...sectionReveal} className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">Production & Logistics</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl p-6 shadow-soft bg-card hover:shadow-elevated transition-shadow lg:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Film className="w-5 h-5 text-primary" />
              </div>
              <p className="font-medium mb-1">Final Video Production</p>
              <p className="text-2xl font-semibold tabular-nums">{fmt(pricing.video_production)}</p>
              <p className="text-muted-foreground text-sm">4 PSD Cameras · Per Show</p>
            </div>

            <div className="rounded-2xl p-6 shadow-soft bg-card hover:shadow-elevated transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <p className="font-medium mb-1">Generator Backup</p>
              <p className="text-2xl font-semibold tabular-nums">{fmt(pricing.generator_backup)}</p>
              <p className="text-muted-foreground text-sm">Per Hour</p>
            </div>

            <div className="rounded-2xl p-6 shadow-soft bg-card hover:shadow-elevated transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <p className="font-medium mb-1">Valet Driver / Parking</p>
              <p className="text-2xl font-semibold tabular-nums">{fmt(pricing.valet)}</p>
              <p className="text-muted-foreground text-sm">Upto 4 hrs · +रू 300/hr</p>
            </div>

            <div className="rounded-2xl p-6 shadow-soft bg-card hover:shadow-elevated transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="font-medium mb-1">Venue Assistance</p>
              <p className="text-2xl font-semibold tabular-nums">{fmt(pricing.venue_assistance)}</p>
              <p className="text-muted-foreground text-sm">Upto 4 hrs · +रू 300/hr</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
