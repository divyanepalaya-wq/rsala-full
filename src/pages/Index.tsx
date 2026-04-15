import TopBar from "@/components/TopBar";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import GallerySection from "@/components/GallerySection";
import ReviewsSection from "@/components/ReviewsSection";
import PricingSection from "@/components/PricingSection";
import CalendarBookingSection from "@/components/CalendarBookingSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <GallerySection />
        <ReviewsSection />
        <PricingSection />
        <CalendarBookingSection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
