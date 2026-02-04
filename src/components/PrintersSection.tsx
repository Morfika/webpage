import { Layers, Maximize } from "lucide-react";
import { getPrinters } from "@/lib/data";

const PrintersSection = () => {
  const printers = getPrinters();

  return (
    <section className="py-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Nuestro Equipo</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-junge font-medium">
            Contamos con impresoras 3D de última generación para garantizar la mejor calidad en cada proyecto.
          </p>
        </div>

        {/* Printers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {printers.map((printer) => (
            <div
              key={printer.id}
              className="bg-card rounded-2xl overflow-hidden card-glow border border-border"
            >
              <div className="aspect-video bg-muted relative overflow-hidden">
                <img
                  src={printer.image}
                  alt={printer.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3 text-foreground">{printer.name}</h3>
                <p className="text-muted-foreground mb-6">{printer.description}</p>

                <div className="space-y-4">
                  {/* Dimensions */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-morfika-purple/20">
                      <Maximize className="w-5 h-5 text-morfika-glow" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Dimensiones</p>
                      <p className="text-sm text-muted-foreground">{printer.dimensions}</p>
                    </div>
                  </div>

                  {/* Materials */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-morfika-purple/20">
                      <Layers className="w-5 h-5 text-morfika-glow" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Materiales</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {printer.materials.map((material) => (
                          <span
                            key={material}
                            className="px-2 py-1 text-xs rounded-full bg-morfika-purple/20 text-morfika-glow border border-morfika-purple/30"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrintersSection;
