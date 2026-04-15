import { motion } from "framer-motion";
import { useSiteSettings } from "@/lib/siteSettings";

const MAPS_URL = "https://maps.app.goo.gl/hFRaoHotrgMUpkcZ7";

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const reviews = [
  {
    name: "Bikesh Youngya",
    badge: "Local Guide",
    avatar: "/reviews/bikesh.png",
    date: "1 year ago",
    text: "Nepa~laya in Kathmandu offers a comprehensive cultural experience — a live music venue, an intimate 80-seat theater, Mokka cafe, and a bookshop. The venue actively promotes local and international artists through music, literature, and film. A visit is highly recommended for anyone in Kathmandu.",
    photos: ["/reviews/bikeshphoto1.png", "/reviews/bikeshphoto2.png", "/reviews/bikeshphoto3.png"],
  },
  {
    name: "Kriti Rajkarnikar",
    badge: null,
    avatar: "/reviews/kirti.png",
    date: "11 months ago",
    text: "Great space for Books n Coffee!",
    photos: null,
  },
  {
    name: "Shiva Hari",
    badge: null,
    avatar: "/reviews/shiva.png",
    date: "3 months ago",
    text: "Awesome",
    photos: ["/reviews/shivaphoto1.png", "/reviews/shivaphoto2.png", "/reviews/shivaphoto3.png"],
  },
];

const ReviewsSection = () => {
  const { reviews_enabled } = useSiteSettings();
  if (!reviews_enabled) return null;
  return (
  <section className="py-10 md:py-16 bg-secondary">
    <div className="container mx-auto px-6">

      <motion.div {...fade} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Reviews</span>
          <h2 className="text-3xl md:text-4xl mt-1">Loved by visitors.</h2>
        </div>
        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary transition-colors shrink-0">
          <span className="text-[#FBBC04]">★★★★★</span> 5.0 · Google Maps
        </a>
      </motion.div>

      <motion.div {...fade} transition={{ ...fade.transition, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">

        {/* Bikesh — wide */}
        <div className="bg-background rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <img src={reviews[0].avatar} alt={reviews[0].name}
              className="w-9 h-9 rounded-full object-cover shrink-0" />
            <div>
              <p className="text-sm font-semibold">{reviews[0].name}</p>
              <p className="text-xs text-muted-foreground">{reviews[0].badge} · {reviews[0].date}</p>
            </div>
            <span className="ml-auto text-sm text-[#FBBC04]">★★★★★</span>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">{reviews[0].text}</p>
          <div className="flex gap-2">
            {reviews[0].photos!.map((src, i) => (
              <div key={i} className="flex-1 aspect-[2/3] rounded-lg overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Kriti + Shiva stacked */}
        <div className="flex flex-col gap-4">
          {reviews.slice(1).map((r) => (
            <div key={r.name} className="bg-background rounded-2xl p-6 space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <img src={r.avatar} alt={r.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <span className="ml-auto text-sm text-[#FBBC04]">★★★★★</span>
              </div>
              <p className="text-sm text-foreground/70">{r.text}</p>
              {r.photos && (
                <div className="flex gap-2">
                  {r.photos.map((src, i) => (
                    <div key={i} className="flex-1 h-20 rounded-lg overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover object-center" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </motion.div>
    </div>
  </section>
  );
};

export default ReviewsSection;
