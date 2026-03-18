import { motion } from "framer-motion";
import heroImage from "@/assets/hero-auditorium.jpg";

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
};

const HeroSection = () => {
  return (
    <section className="min-h-[80vh] flex items-center bg-background">
      <div className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div {...sectionReveal} className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
            A Space for Sound,{" "}
            <span className="text-primary">Story</span>, and Spirit.
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Kathmandu's premier 70-pax intimate auditorium, managed by Nepa-laya.
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href="#booking"
              className="inline-flex items-center justify-center min-h-[44px] px-8 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated active:scale-95"
            >
              Request Booking
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center min-h-[44px] px-8 rounded-lg bg-secondary text-secondary-foreground font-medium transition-all duration-200 hover:bg-accent"
            >
              View Pricing
            </a>
          </div>
        </motion.div>
        <motion.div
          {...sectionReveal}
          transition={{ ...sectionReveal.transition, delay: 0.1 }}
          className="relative"
        >
          <div className="rounded-2xl overflow-hidden shadow-elevated">
            <img
              src={heroImage}
              alt="r-sala intimate auditorium in Kathmandu with stage lighting and seating"
              className="w-full aspect-[4/3] object-cover"
              loading="eager"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
