import { motion } from "framer-motion";

const images = [
  { src: "/gallery/rsala-audience33.jpeg", alt: "r-sala community outside the venue" },
  { src: "/gallery/IMG_8265.jpg",          alt: "Singer in performance at r-sala" },
  { src: "/gallery/rsala-audience.jpeg",   alt: "Audience at an r-sala event" },
  { src: "/gallery/IMG_4675.jpg",          alt: "Live band session at r-sala" },
  { src: "/gallery/IMG_0515.jpg",          alt: "Full ensemble performance at r-sala" },
  { src: "/gallery/paleti-session.jpg",    alt: "Paleti music session at r-sala" },
  { src: "/gallery/IMG_0812.jpg",          alt: "Book launch at r-sala" },
  { src: "/gallery/rsala-audience2.jpeg",  alt: "Community gathering at r-sala" },
  { src: "/gallery/IMG_4215.jpg",          alt: "Book launch event at r-sala" },
  { src: "/gallery/auditorium-side.jpg",   alt: "r-sala auditorium space" },
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-10 md:py-16 bg-background">
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-end justify-between mb-6 md:mb-8"
        >
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">
              Gallery
            </span>
            <h2 className="text-3xl md:text-4xl mt-1">
              The Space &amp; Community
            </h2>
          </div>
          {/* <span className="text-sm text-muted-foreground hidden sm:block tabular-nums">
            {images.length} moments
          </span> */}
        </motion.div>

        {/* Masonry columns — images keep their natural ratios */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="columns-2 md:columns-4 gap-2 md:gap-2"
        >
          {images.map((img, i) => (
            <div
              key={img.src}
              className="break-inside-avoid mb-2 md:mb-2.5 overflow-hidden rounded group cursor-zoom-in"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default GallerySection;
