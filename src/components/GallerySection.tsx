import { motion } from "framer-motion";
import aboutImage from "@/assets/paleti-session.jpg";
import sideImage from "@/assets/auditorium-side.jpg";

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const images = [
  { src: aboutImage, alt: "Paleti music session at r-sala", span: true },
  { src: sideImage, alt: "r-sala auditorium stage and lighting" },
  { src: "/gallery/IMG_0515.jpg", alt: "r-sala venue photo 1" },
  { src: "/gallery/IMG_0812.jpg", alt: "r-sala venue photo 2" },
  { src: "/gallery/IMG_4215.jpg", alt: "r-sala venue photo 3" },
  { src: "/gallery/IMG_4675.jpg", alt: "r-sala venue photo 4" },
  { src: "/gallery/IMG_8265.jpg", alt: "r-sala venue photo 5" },
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-14 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div {...sectionReveal} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">The Space</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A glimpse into the vibrant, intimate atmosphere of r-sala.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {images.map((img, i) => (
            <motion.div
              key={img.src}
              {...sectionReveal}
              transition={{ ...sectionReveal.transition, delay: i * 0.07 }}
              className={`rounded-2xl overflow-hidden shadow-soft ${img.span ? "col-span-2" : ""}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className={`w-full object-cover ${img.span ? "aspect-[16/9]" : "aspect-square"}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
