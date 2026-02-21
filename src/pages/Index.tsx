import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ProductCategoriesSection from "@/components/ProductCategoriesSection";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div className="naija-section-divider" />
      <HowItWorksSection />
      <div className="naija-section-divider" />
      <ProductCategoriesSection />
      <div className="naija-section-divider" />
      <CommunitySection />
      <Footer />
    </div>
  );
};

export default Index;
