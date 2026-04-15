import { motion } from "framer-motion";
import heroImage from "@/assets/hero-auditorium.jpg";
import { scrollToSection } from "@/components/SiteHeader";

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const HeroSection = () => {
  return (
    <section className="min-h-fit md:min-h-[80vh] flex items-center bg-background">
      <div className="container mx-auto px-6 py-12 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div {...sectionReveal} className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
            A Space for Sound,{" "}
            <span className="text-primary">Story</span>, and Spirit.
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Kathmandu's premier 80-pax intimate auditorium, managed by Nepa-laya.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => scrollToSection("#booking")}
              className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-8 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated active:scale-95"
            >
              Request Booking
            </button>
            <button
              onClick={() => scrollToSection("#pricing")}
              className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-8 rounded-lg bg-secondary text-secondary-foreground font-medium transition-all duration-200 hover:bg-accent"
            >
              View Pricing
            </button>
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
