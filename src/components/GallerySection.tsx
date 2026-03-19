import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import heic2any from "heic2any";

const heicFiles = [
  "/gallery/IMG_0515.HEIC",
  "/gallery/IMG_0812.HEIC",
  "/gallery/IMG_4215.HEIC",
  "/gallery/IMG_4675.HEIC",
  "/gallery/IMG_8265.HEIC",
];

const sectionReveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const GallerySection = () => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const convertAll = async () => {
      const urls: string[] = [];
      for (const path of heicFiles) {
        try {
          const res = await fetch(path);
          const blob = await res.blob();
          const converted = await heic2any({ blob, toType: "image/jpeg", quality: 0.85 });
          const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
          urls.push(URL.createObjectURL(jpegBlob));
        } catch {
          console.warn(`Failed to convert ${path}`);
        }
      }
      setImages(urls);
      setLoading(false);
    };
    convertAll();

    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="gallery" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div {...sectionReveal} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">The Space</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A glimpse into the vibrant, intimate atmosphere of r-sala.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`bg-muted animate-pulse rounded-2xl ${
                  i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {images.map((src, i) => (
              <motion.div
                key={i}
                {...sectionReveal}
                transition={{ ...sectionReveal.transition, delay: i * 0.08 }}
                className={`rounded-2xl overflow-hidden shadow-soft ${
                  i === 0 ? "col-span-2 row-span-1" : ""
                }`}
              >
                <img
                  src={src}
                  alt={`r-sala venue photo ${i + 1}`}
                  className={`w-full object-cover ${
                    i === 0 ? "aspect-[16/9]" : "aspect-square"
                  }`}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;
