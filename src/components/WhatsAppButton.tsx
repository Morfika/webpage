import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  message?: string;
  phone?: string;
  className?: string;
  children?: React.ReactNode;
}

const WhatsAppButton = ({ 
  message = "Hola! Me interesa cotizar una impresión 3D", 
  phone = "573117349398",
  className = "",
  children 
}: WhatsAppButtonProps) => {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className={`btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-primary-foreground ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      {children || "Cotizar por WhatsApp"}
    </button>
  );
};

export default WhatsAppButton;
