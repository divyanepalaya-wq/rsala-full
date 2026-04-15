import { motion } from "framer-motion";

// 12 square-grid images + 1 full-width anchor at the bottom
const gridImages = [
  { src: "/gallery/smile.png",             alt: "Performer at r-sala" },
  { src: "/gallery/IMG_8265.jpg",          alt: "Singer in performance at r-sala" },
  { src: "/gallery/talk.png",              alt: "Talk session at r-sala" },
  { src: "/gallery/rsala-audience.jpeg",   alt: "Audience at an r-sala event" },
  { src: "/gallery/IMG_4675.jpg",          alt: "Live band session at r-sala" },
  { src: "/gallery/paleti-session.jpg",    alt: "Paleti music session at r-sala" },
  { src: "/gallery/IMG_0812.jpg",          alt: "Book launch at r-sala" },
  { src: "/gallery/IMG_4215.jpg",          alt: "Book launch event at r-sala" },
  { src: "/gallery/women-in-politics.png", alt: "Women in politics discussion at r-sala" },
  { src: "/gallery/auditorium-side.jpg",   alt: "r-sala auditorium space" },
  { src: "/gallery/rsala-audience2.jpeg",  alt: "Community gathering at r-sala" },
  { src: "/gallery/rsala-audience33.jpeg", alt: "r-sala community outside the venue" },
];

const wideImage = {
  src: "/gallery/IMG_0515.jpg",
  alt: "Full ensemble performance at r-sala",
};

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
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2"
        >
          {/* 4×3 uniform square grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {gridImages.map((img, i) => (
              <div
                key={img.src}
                className="overflow-hidden rounded group cursor-zoom-in"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full aspect-square object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  loading={i < 4 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            ))}
          </div>

          {/* Full-width cinematic anchor row */}
          <div className="overflow-hidden rounded group cursor-zoom-in">
            <img
              src={wideImage.src}
              alt={wideImage.alt}
              className="w-full aspect-[4/1] object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default GallerySection;
