import { Printer, Palette, Wrench, Package } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";

const services = [
  {
    icon: Printer,
    title: "Impresión 3D",
    description: "Imprimimos cualquier diseño en diversos materiales con alta precisión y acabado profesional."
  },
  {
    icon: Palette,
    title: "Pintura y Acabados",
    description: "Servicio de pintura y post-procesado para lograr el acabado perfecto en tus piezas."
  },
  {
    icon: Wrench,
    title: "Prototipado",
    description: "Desarrollo de prototipos funcionales para validar tus diseños antes de producción."
  },
  {
    icon: Package,
    title: "Producción en Serie",
    description: "Producción de múltiples unidades con calidad consistente y tiempos optimizados."
  }
];

const ServicesSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Nuestros Servicios</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-junge font-medium">
            Ofrecemos soluciones completas de impresión 3D adaptadas a tus necesidades.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="bg-card p-8 rounded-2xl border border-border card-glow group"
            >
              <div className="mb-6 p-4 rounded-xl bg-morfika-purple/20 w-fit group-hover:bg-morfika-purple/30 transition-colors">
                <service.icon className="w-8 h-8 text-morfika-glow" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <WhatsAppButton message="Hola! Quiero cotizar un servicio de impresión 3D">
            Cotiza tu Proyecto
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
