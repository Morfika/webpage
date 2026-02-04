import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import GallerySection from "@/components/GallerySection";
import PrintersSection from "@/components/PrintersSection";
import ServicesSection from "@/components/ServicesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <GallerySection />
        <PrintersSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
