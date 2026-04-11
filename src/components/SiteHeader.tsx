import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/r-sala-logo.png";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#gallery", label: "Gallery" },
  { href: "#pricing", label: "Pricing" },
];

export const scrollToSection = (href: string) => {
  const id = href.startsWith("#") ? href.slice(1) : href;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    // Small delay to let sidebar close animation start
    setTimeout(() => scrollToSection(href), 150);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 flex items-center justify-between h-[72px]">
          <a
            href="/"
            className="flex items-center"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img src={logo} alt="r-sala logo" className="h-12 w-auto" />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(href);
                }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </a>
            ))}
            <Button
              size="sm"
              onClick={() => scrollToSection("#booking")}
            >
              Book Now
            </Button>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      <div
        id="mobile-sidebar"
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          mobileOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />

        {/* Sidebar panel */}
        <div
          className={`absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-background shadow-elevated flex flex-col transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-6 h-[72px] border-b border-border shrink-0">
            <img src={logo} alt="r-sala logo" className="h-10 w-auto" />
            <button
              onClick={() => setMobileOpen(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Mobile navigation">
            {navLinks.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => handleNavClick(href)}
                className="w-full text-left py-3 px-4 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Book Now CTA */}
          <div className="px-6 pb-8 shrink-0">
            <Button
              className="w-full"
              size="lg"
              onClick={() => handleNavClick("#booking")}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SiteHeader;
