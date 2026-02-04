import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProducts, type Product } from "@/lib/data";
import { ShoppingBag, MessageCircle } from "lucide-react";

const Productos = () => {
  const [products] = useState<Product[]>(getProducts());

  const handleBuy = (product: Product) => {
    const message = `Hola! Me interesa comprar: ${product.name} - $${product.price.toLocaleString()}`;
    window.open(`https://wa.me/573000000000?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Productos</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Piezas listas para enviar. Todas nuestras creaciones impresas en 3D de alta calidad.
            </p>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-card rounded-2xl overflow-hidden border border-border card-glow group"
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-morfika-purple/90 text-xs font-medium text-white">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-foreground">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-morfika-glow">
                        ${product.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleBuy(product)}
                        className="btn-glow px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Sin productos disponibles</h3>
              <p className="text-muted-foreground">Pronto agregaremos nuevos productos.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Productos;
