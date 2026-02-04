import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/sorteos", label: "Sorteos" },
    { href: "/productos", label: "Productos" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
              <span className="text-5xl font-bold text-gradient tracking-wider  font-jomhuria text-gradient
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:text-transparent
              group-hover:bg-clip-text
              group-hover:bg-gradient-to-r
              group-hover:from-morfika-purple
              group-hover:to-morfika-glow">MORFIKA</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative text-sm font-medium tracking-wide transition-colors ${
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-morfika-purple to-morfika-glow rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Admin Link */}
          <div className="hidden md:block">
            <Link to="/admin">
              <Button variant="outline" size="sm" className="border-border hover:border-morfika-glow/50 hover:bg-morfika-glow/10">
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-border">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium py-2 ${
                    isActive(link.href)
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium py-2 text-muted-foreground"
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
