import { motion } from "framer-motion";
import aboutImage from "@/assets/paleti-session.jpg";
import sideImage from "@/assets/auditorium-side.jpg";

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
};

const AboutSection = () => {
  return (
    <section id="about" className="bg-secondary py-24">
      <div className="container mx-auto px-6">
        <motion.div {...sectionReveal} className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-6">About r-sala</h2>
          <p className="text-muted-foreground text-lg">
            r-sala is the heart of acoustic excellence and the home of the Paleti music series.
            Curated by Nepa-laya, we offer a professional, tiered-seating environment for concerts,
            book launches, and seminars.
          </p>
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
