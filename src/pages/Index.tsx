import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import HomeProductShowcase from "@/components/HomeProductShowcase";
import ProductCategoriesSection from "@/components/ProductCategoriesSection";
import CommunitySection from "@/components/CommunitySection";
import NewsletterSignup from "@/components/NewsletterSignup";
import Footer from "@/components/Footer";
import FeaturedCollections from "@/components/FeaturedCollections";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedCollections />
      <HomeProductShowcase />
      <HowItWorksSection />
      <ProductCategoriesSection />
      <CommunitySection />
      <NewsletterSignup />
      <Footer />
    </div>
  );
};

export default Index;
