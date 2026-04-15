import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const technical = [
  { label: "Sound",                  price: "5,000"  },
  { label: "Light",                  price: "5,000"  },
  { label: "Video Technical",        price: "5,000"  },
  { label: "Sound & Light Bundle",   price: "15,000", highlight: true },
];

const production = [
  { label: "Final Video Production", sub: "4 PSD Cameras · per show",       price: "20,000" },
  { label: "Generator Backup",       sub: "Per hour",                        price: "2,000"  },
  { label: "Valet / Parking",        sub: "Up to 4 hrs · +रू 300/hr",       price: "1,500"  },
  { label: "Venue Assistance",       sub: "Up to 4 hrs · +रू 300/hr",       price: "1,500"  },
];

const PricingSection = () => (
  <section id="pricing" className="py-10 md:py-16 bg-background">
    <div className="container mx-auto px-6">

      {/* Header */}
      <motion.div {...fade} className="mb-8 md:mb-10">
        <span className="text-xs uppercase tracking-widest text-primary font-semibold">Pricing</span>
        <h2 className="text-3xl md:text-4xl mt-1">What it costs.</h2>
      </motion.div>

      {/* Hall Rental — dark hero block */}
      <motion.div {...fade} className="rounded-2xl overflow-hidden bg-foreground mb-4">
        <div className="p-7 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Hall Rental</p>
            <h3 className="text-2xl md:text-3xl font-semibold text-white leading-snug">
              The full space,<br className="hidden md:block" /> set for your event.
            </h3>
            <p className="text-white/40 text-sm mt-3">Max 80 Pax · Tiered Seating · Professional Stage</p>
          </div>
          <div className="flex md:flex-col gap-3 shrink-0">
            <div className="flex-1 md:flex-none rounded-xl bg-white/[0.07] border border-white/10 px-6 py-4 md:text-right">
              <p className="text-white/40 text-xs mb-1">Up to 4 hours</p>
              <p className="text-2xl font-bold tabular-nums text-primary">रू 15,000</p>
            </div>
            <div className="flex-1 md:flex-none rounded-xl bg-white/[0.07] border border-white/10 px-6 py-4 md:text-right">
              <p className="text-white/40 text-xs mb-1">Up to 8 hours</p>
              <p className="text-2xl font-bold tabular-nums text-primary">रू 25,000</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Service lists — two panels */}
      <motion.div
        {...fade}
        transition={{ ...fade.transition, delay: 0.1 }}
        className="grid md:grid-cols-2 gap-4"
      >
        {/* Technical */}
        <div className="rounded-2xl bg-secondary p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-5">
            Technical
          </p>
          <div className="space-y-4">
            {technical.map(({ label, price, highlight }) => (
              <div
                key={label}
                className={`flex items-center justify-between gap-4 ${
                  highlight
                    ? "py-2.5 px-3 -mx-3 rounded-lg bg-primary/10 border border-primary/20"
                    : ""
                }`}
              >
                <span className={`text-sm ${highlight ? "font-semibold" : "text-foreground/80"}`}>
                  {label}
                </span>
                <span className={`text-sm font-semibold tabular-nums shrink-0 ${
                  highlight ? "text-primary" : ""
                }`}>
                  रू {price}
                </span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">All prices per show</p>
          </div>
        </div>

        {/* Production & Logistics */}
        <div className="rounded-2xl bg-secondary p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-5">
            Production &amp; Logistics
          </p>
          <div className="space-y-4">
            {production.map(({ label, sub, price }) => (
              <div key={label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/80">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums shrink-0">रू {price}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  </section>
);

export default PricingSection;
