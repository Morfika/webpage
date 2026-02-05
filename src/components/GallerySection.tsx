import { getGallery } from "@/lib/data";
import gallery1 from "@/assets/gallery-1.png";
import gallery2 from "@/assets/gallery-2.png";
import gallery3 from "@/assets/gallery-3.png";
import gallery4 from "@/assets/gallery-4.png";
import gallery5 from "@/assets/gallery-5.png";
import gallery6 from "@/assets/gallery-6.png";
import gallery7 from "@/assets/gallery-7.png";
import gallery8 from "@/assets/gallery-8.png";

const galleryImages = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6, gallery7, gallery8];

const GallerySection = () => {
  const gallery = getGallery();

  return (
    <section id="galeria" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Galería</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-junge font-medium">
            Algunos de nuestros trabajos recientes. Cada pieza es única y hecha con pasión.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gallery.map((item, index) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-xl overflow-hidden card-glow bg-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={galleryImages[index % galleryImages.length]}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
