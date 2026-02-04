import { X, MessageCircle } from "lucide-react";
import { type Raffle } from "@/lib/data";

interface RaffleModalProps {
  raffle: Raffle;
  onClose: () => void;
}

const RaffleModal = ({ raffle, onClose }: RaffleModalProps) => {
  const handleNumberClick = (number: number) => {
    const message = `Hola! Quiero comprar el número ${number} de la rifa "${raffle.title}" por $${raffle.price.toLocaleString()}`;
    window.open(`https://wa.me/573117349398?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-card rounded-2xl border border-border max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{raffle.title}</h2>
            <p className="text-muted-foreground">{raffle.description}</p>
            <p className="text-morfika-glow font-semibold mt-2">
              Precio por número: ${raffle.price.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Numbers Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-morfika-purple to-morfika-blue" />
              <span className="text-sm text-muted-foreground">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted opacity-50" />
              <span className="text-sm text-muted-foreground">Vendido</span>
            </div>
          </div>

          <div className="grid grid-cols-10 gap-2">
            {raffle.numbers.map((num) => (
              <button
                key={num.number}
                disabled={num.sold}
                onClick={() => !num.sold && handleNumberClick(num.number)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                  num.sold
                    ? "number-sold"
                    : "number-available"
                }`}
              >
                {num.number}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Haz clic en un número disponible para comprarlo por WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
};

export default RaffleModal;
