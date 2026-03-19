import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import aboutImage from "@/assets/paleti-session.jpg";
import sideImage from "@/assets/auditorium-side.jpg";

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const VENUE_MAP_URL =
  "https://maps.app.goo.gl/j1RMyeUB19DXYqor7";

const AboutSection = () => {
  return (
    <section id="about" className="bg-secondary py-24">
      <div className="container mx-auto px-6">
        <motion.div {...sectionReveal} className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-6">About r-sala</h2>
          <p className="text-muted-foreground text-lg mb-8">
            r-sala is the heart of acoustic excellence and the home of the Paleti music series.
            Curated by Nepa-laya, we offer a professional, tiered-seating environment for concerts,
            book launches, and seminars.
          </p>

          {/* Dictionary meaning */}
          <div className="bg-background rounded-2xl p-6 md:p-8 shadow-soft text-left max-w-md mx-auto mb-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">The meaning behind the name</p>
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold">sala <span className="text-muted-foreground font-normal text-sm">|'salə|</span></p>
                <p className="text-sm text-muted-foreground italic">noun</p>
                <p className="text-foreground mt-1">a living room</p>
                <p className="text-xs text-muted-foreground mt-1">— Oxford Dictionary of English</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-lg font-semibold">शाला <span className="text-muted-foreground font-normal text-sm">|śālā| f.</span></p>
                <p className="text-foreground mt-1">house, place, hall <span className="text-muted-foreground text-sm">(esp. as devoted to a particular purpose)</span></p>
                <p className="text-xs text-muted-foreground mt-1">— Oxford Hindi Dictionaries</p>
              </div>
            </div>
          </div>

          {/* Venue link */}
          <a
            href={VENUE_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            View venue on Google Maps
          </a>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div {...sectionReveal} className="rounded-2xl overflow-hidden shadow-soft">
            <img
              src={aboutImage}
              alt="Paleti music session at r-sala with traditional musicians performing"
              className="w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
          </motion.div>
          <motion.div
            {...sectionReveal}
            transition={{ ...sectionReveal.transition, delay: 0.1 }}
            className="rounded-2xl overflow-hidden shadow-soft"
          >
            <img
              src={sideImage}
              alt="r-sala auditorium showing stage equipment and professional lighting"
              className="w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
