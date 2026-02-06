import { useState } from "react";
import { X, MessageCircle, Info, Lock } from "lucide-react";
import { type Raffle, type RaffleNumber } from "@/lib/data";

interface RaffleModalProps {
  raffle: Raffle;
  onClose: () => void;
}

const RaffleModal = ({ raffle, onClose }: RaffleModalProps) => {
  const [selectedSoldNumber, setSelectedSoldNumber] = useState<RaffleNumber | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const handleNumberClick = (number: number) => {
    const message = `Hola! Quiero comprar el número ${number} de la rifa "${raffle.title}" por $${raffle.price.toLocaleString()}`;
    window.open(`https://wa.me/573117349398?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSoldNumberClick = (num: RaffleNumber) => {
    setSelectedSoldNumber(num);
    setCodeInput("");
    setCodeVerified(false);
    setCodeError(false);
  };

  const handleCodeVerify = () => {
    if (!selectedSoldNumber) return;
    
    if (codeInput.trim() === selectedSoldNumber.buyerCode) {
      setCodeVerified(true);
      setCodeError(false);
    } else {
      setCodeError(true);
      setCodeInput("");
    }
  };

  const handleCloseModal = () => {
    setSelectedSoldNumber(null);
    setCodeInput("");
    setCodeVerified(false);
    setCodeError(false);
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
                onClick={() => num.sold ? handleSoldNumberClick(num) : handleNumberClick(num.number)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                  num.sold
                    ? "number-sold cursor-pointer hover:opacity-80"
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

      {/* Sold Number Info Modal */}
      {selectedSoldNumber && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setSelectedSoldNumber(null)}
        >
          <div 
            className="bg-card rounded-2xl border border-border max-w-sm w-full shadow-2xl p-6 animate-in fade-in zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${selectedSoldNumber.paid ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
                  <Info className={selectedSoldNumber.paid ? "w-5 h-5 text-red-500" : "w-5 h-5 text-yellow-500"} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${selectedSoldNumber.paid ? "text-red-500" : "text-yellow-600"}`}>
                    No disponible
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedSoldNumber.paid ? "Número Vendido" : "Número Apartado"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSoldNumber(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <div className="text-center mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Número</p>
                  <p className="text-3xl font-bold text-morfika-glow">{selectedSoldNumber.number}</p>
                </div>
                {/* <div className="text-center border-t border-border/30 pt-3">
                  <p className="text-xs text-muted-foreground mb-1">Código de compra</p>
                  <p className="text-lg font-mono font-bold text-foreground">{selectedSoldNumber.buyerCode || "—"}</p>
                </div> */}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Comprador</p>
                  <p className="text-sm font-medium text-foreground">{selectedSoldNumber.buyerName || "No especificado"}</p>
                </div>
              </div>

              <div className="bg-morfika-purple/10 border border-morfika-purple/20 rounded-lg p-3">
                <p className="text-xs text-morfika-glow text-center">
                  ✨ Este número ya está reservado. Si deseas comprar, contáctanos por WhatsApp.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSoldNumber(null)}
              className="w-full mt-4 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-foreground text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaffleModal;
