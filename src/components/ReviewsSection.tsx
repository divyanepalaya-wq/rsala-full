import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const MAPS_URL = "https://maps.app.goo.gl/hFRaoHotrgMUpkcZ7";

const fade = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const Stars = ({ count = 5 }: { count?: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#FBBC04">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const reviews = [
  {
    name: "Bikesh Youngya",
    role: "Local Guide",
    avatar: "/reviews/bikesh.png",
    stars: 5,
    date: "1 year ago",
    text: "Nepa~laya in Kathmandu, Kalikasthan, offers a comprehensive cultural experience. Its facilities include a state-of-the-art live music venue (Paleti), an intimate 80-seat theater, a Mokka cafe providing high-quality coffee and pastries, and a bookshop featuring Nepa~laya publications. The venue actively promotes local and international artists and authors through music, literature, and independent film screenings. A visit is highly recommended for anyone in Kathmandu.",
    photos: null,
  },
  {
    name: "Kriti Rajkarnikar",
    role: null,
    avatar: "/reviews/kirti.png",
    stars: 5,
    date: "11 months ago",
    text: "Great space for Books n Coffee!",
    photos: null,
  },
  {
    name: "Shiva Hari",
    role: null,
    avatar: "/reviews/shiva.png",
    stars: 5,
    date: "3 months ago",
    text: "Awesome",
    photos: ["/reviews/shivaphoto1.png", "/reviews/shivaphoto2.png", "/reviews/shivaphoto3.png"],
  },
];

const ReviewsSection = () => (
  <section className="py-10 md:py-16 bg-secondary">
    <div className="container mx-auto px-6">

      {/* Header */}
      <motion.div {...fade} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Reviews</span>
          <h2 className="text-3xl md:text-4xl mt-1">Loved by visitors.</h2>
        </div>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors shrink-0 group"
        >
          <GoogleIcon />
          <span className="text-[#FBBC04] tracking-tight font-medium">★★★★★</span>
          <span>5.0 · Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </motion.div>

      {/* Cards grid — Bikesh wide, Kriti + Shiva stacked */}
      <motion.div
        {...fade}
        transition={{ ...fade.transition, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4"
      >
        {/* Bikesh — featured wide card */}
        <div className="bg-background rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={reviews[0].avatar} alt={reviews[0].name}
                className="w-10 h-10 rounded-full object-cover shrink-0" />
              <div>
                <p className="text-sm font-semibold leading-tight">{reviews[0].name}</p>
                <p className="text-xs text-primary mt-0.5">{reviews[0].role}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Stars count={reviews[0].stars} />
              <p className="text-xs text-muted-foreground">{reviews[0].date}</p>
            </div>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">{reviews[0].text}</p>
        </div>

        {/* Right column — Kriti + Shiva */}
        <div className="flex flex-col gap-4">

          {/* Kriti */}
          <div className="bg-background rounded-2xl p-6 flex flex-col gap-3 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={reviews[1].avatar} alt={reviews[1].name}
                  className="w-10 h-10 rounded-full object-cover shrink-0" />
                <p className="text-sm font-semibold">{reviews[1].name}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Stars count={reviews[1].stars} />
                <p className="text-xs text-muted-foreground">{reviews[1].date}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">{reviews[1].text}</p>
          </div>

          {/* Shiva — with photos */}
          <div className="bg-background rounded-2xl p-6 flex flex-col gap-3 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={reviews[2].avatar} alt={reviews[2].name}
                  className="w-10 h-10 rounded-full object-cover shrink-0" />
                <p className="text-sm font-semibold">{reviews[2].name}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Stars count={reviews[2].stars} />
                <p className="text-xs text-muted-foreground">{reviews[2].date}</p>
              </div>
            </div>
            <p className="text-sm text-foreground/70">{reviews[2].text}</p>
            {reviews[2].photos && (
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                {reviews[2].photos.map((src, i) => (
                  <div key={i} className="rounded-lg overflow-hidden aspect-square">
                    <img src={src} alt={`Photo by ${reviews[2].name}`}
                      className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* Google attribution */}
      <motion.div {...fade} transition={{ ...fade.transition, delay: 0.2 }}
        className="mt-5 flex items-center justify-center gap-1.5">
        <p className="text-xs text-muted-foreground/60">Reviews from</p>
        <GoogleIcon />
        <p className="text-xs text-muted-foreground/60">Google Maps</p>
      </motion.div>

    </div>
  </section>
);

export default ReviewsSection;
