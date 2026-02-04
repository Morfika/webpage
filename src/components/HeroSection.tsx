import { Sparkles, ArrowDown } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";
import heroImage from "@/assets/hero-3d-print.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="MORFIKA 3D Printing"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-morfika-glow/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-morfika-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-morfika-pink/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-morfika-purple/20 border border-morfika-purple/30 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-morfika-glow" />
            <span className="text-sm font-medium text-morfika-glow">Impresión 3D Profesional</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold mb-6 tracking-wider font-jomhuria">
            <span className="text-gradient glow-text">MORFIKA</span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/90 mb-4 font-light ">
            Transformamos tus ideas en realidad
          </p>

          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-junge font-medium">
            Servicios de impresión 3D de alta calidad. Desde prototipos hasta piezas funcionales, 
            llevamos tu imaginación del diseño al objeto tangible.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <WhatsAppButton className="text-lg px-8 py-4" />
            <a
              href="#galeria"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-foreground border border-border hover:border-morfika-glow/50 hover:bg-morfika-glow/10 transition-all backdrop-blur-sm"
            >
              Ver Galería
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
