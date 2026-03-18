import { motion } from "framer-motion";
import { Mic, Camera, Lightbulb, Film, Users, Zap } from "lucide-react";

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div {...sectionReveal} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">Pricing</h2>
          <p className="text-muted-foreground text-lg">Transparent pricing for every event need.</p>
        </motion.div>

        {/* Venue Rental */}
        <motion.div {...sectionReveal} className="max-w-4xl mx-auto mb-12">
          <div className="rounded-2xl p-8 shadow-soft bg-card transition-shadow hover:shadow-elevated">
            <h3 className="text-xl font-semibold mb-1">Venue Rental</h3>
            <p className="text-muted-foreground text-sm mb-6">Max 70 Pax · Tiered Seating</p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-lg bg-secondary p-6">
                <p className="text-muted-foreground text-sm mb-1">Upto 4 hours</p>
                <p className="text-3xl font-semibold tabular-nums">रू 15,000</p>
              </div>
              <div className="rounded-lg bg-secondary p-6">
                <p className="text-muted-foreground text-sm mb-1">Upto 8 hours</p>
                <p className="text-3xl font-semibold tabular-nums">रू 25,000</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technical Add-ons */}
        <motion.div {...sectionReveal} className="max-w-4xl mx-auto mb-12">
          <h3 className="text-lg font-semibold mb-6">Technical Add-ons</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Mic, label: "Sound", price: "5,000" },
              { icon: Lightbulb, label: "Light", price: "5,000" },
              { icon: Camera, label: "Video", price: "5,000" },
            ].map(({ icon: Icon, label, price }) => (
              <div
                key={label}
                className="rounded-2xl p-6 shadow-soft bg-card hover:shadow-elevated transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-medium mb-1">{label}</p>
                <p className="text-2xl font-semibold tabular-nums">रू {price}</p>
                <p className="text-muted-foreground text-sm">Per Show</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Production & Logistics */}
        <motion.div {...sectionReveal} className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">Production & Logistics</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 shadow-soft bg-card hover:shadow-elevated transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Film className="w-5 h-5 text-primary" />
              </div>
              <p className="font-medium mb-1">Final Video Production</p>
              <p className="text-2xl font-semibold tabular-nums">रू 20,000</p>
              <p className="text-muted-foreground text-sm">4 PSD Cameras</p>
            </div>
            <div className="rounded-2xl p-6 shadow-soft bg-card hover:shadow-elevated transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="font-medium mb-1">Valet / Assistance</p>
              <p className="text-2xl font-semibold tabular-nums">रू 1,500</p>
              <p className="text-muted-foreground text-sm">4 hrs · +रू 300/hr additional</p>
            </div>
            <div className="rounded-2xl p-6 shadow-soft bg-card hover:shadow-elevated transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <p className="font-medium mb-1">Generator Backup</p>
              <p className="text-2xl font-semibold tabular-nums">रू 2,000</p>
              <p className="text-muted-foreground text-sm">Per hour</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
