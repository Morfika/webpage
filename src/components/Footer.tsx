import { Printer, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <Printer className="w-7 h-7 text-morfika-glow" />
              <span className="text-xl font-bold text-gradient">MORFIKA</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Impresión 3D de alta calidad. Llevamos tus ideas del diseño a la realidad.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navegación</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Inicio
              </Link>
              <Link to="/sorteos" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Sorteos
              </Link>
              <Link to="/productos" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Productos
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contacto</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/573117349398"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-morfika-glow transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href="https://instagram.com/dmorfika"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-morfika-glow transition-colors text-sm"
              >
                <Instagram className="w-4 h-4" />
                @dmorfika
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 MORFIKA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
