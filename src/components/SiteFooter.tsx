import logo from "@/assets/r-sala-logo.png";
import { scrollToSection } from "@/components/SiteHeader";
import { useSiteSettings } from "@/lib/siteSettings";
const MAPS_URL      = "https://maps.app.goo.gl/j1RMyeUB19DXYqor7";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const NAV_LINKS = [
  { label: "About",   href: "#about"   },
  { label: "Gallery", href: "#gallery" },
  { label: "Pricing", href: "#pricing" },
  { label: "Book",    href: "#booking" },
];

const SiteFooter = () => {
  const { instagram_url, facebook_url } = useSiteSettings();
  return (
  <footer className="bg-secondary border-t border-border">
    <div className="container mx-auto px-6 py-12">

      {/* Main row */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-10 items-start">

        {/* Brand */}
        <div className="space-y-4">
          <img src={logo} alt="r-sala" className="h-12 w-auto" />
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Kathmandu's premier intimate auditorium for concerts, talks, book launches, and more.
          </p>
          {/* Social */}
          <div className="flex items-center gap-2 pt-1">
            <a href={instagram_url} target="_blank" rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all duration-200">
              <InstagramIcon />
            </a>
            <a href={facebook_url} target="_blank" rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all duration-200">
              <FacebookIcon />
            </a>
          </div>
        </div>

        {/* Links + Contact */}
        <div className="flex gap-12 sm:gap-16">
          {/* Nav */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">
              Explore
            </p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <button
                    onClick={() => scrollToSection(href)}
                    className="text-sm text-foreground/70 hover:text-primary transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">
              Find Us
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Kalikasthan, Kathmandu
                </a>
              </li>
              <li>
                <a href="https://nepalaya.com.np/" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  nepalaya.com.np
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} r-sala · All rights reserved
        </p>
        <p className="text-xs text-muted-foreground">
          Managed by{" "}
          <a href="https://nepalaya.com.np/" target="_blank" rel="noopener noreferrer"
            className="hover:text-primary transition-colors font-medium">
            Nepa-laya
          </a>
        </p>
      </div>

    </div>
  </footer>
  );
};

export default SiteFooter;
