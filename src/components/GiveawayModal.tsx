import { X, Instagram, Check, Clock } from "lucide-react";
import { type Giveaway } from "@/lib/data";

interface GiveawayModalProps {
  giveaway: Giveaway;
  onClose: () => void;
  instagramFollowers?: number;
}

const GiveawayModal = ({ giveaway, onClose, instagramFollowers = 0 }: GiveawayModalProps) => {
  // Usar followers de Instagram si están disponibles, si no usar los almacenados
  const currentFollowers = instagramFollowers > 0 ? instagramFollowers : giveaway.currentFollowers;
  const progress = (currentFollowers / giveaway.targetFollowers) * 100;
  const isReady = currentFollowers >= giveaway.targetFollowers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-card rounded-2xl border border-border max-w-lg w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="aspect-video bg-muted relative">
          <img
            src={giveaway.image}
            alt={giveaway.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{giveaway.title}</h2>
          <p className="text-muted-foreground mb-6">{giveaway.description}</p>

          {/* Status */}
          <div className={`p-4 rounded-xl mb-6 ${isReady ? 'bg-accent/20 border border-accent/30' : 'bg-morfika-purple/10 border border-morfika-purple/30'}`}>
            <div className="flex items-center gap-3 mb-3">
              {isReady ? (
                <>
                  <Check className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-accent">¡Meta alcanzada!</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-morfika-glow" />
                  <span className="font-semibold text-morfika-glow">Esperando meta...</span>
                </>
              )}
            </div>
            
            {/* Progress */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progreso</span>
                <span className="text-foreground font-medium">
                  {currentFollowers}/{giveaway.targetFollowers}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${isReady ? 'bg-accent' : 'bg-gradient-to-r from-morfika-purple to-morfika-glow'}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-3">
              {isReady 
                ? "El sorteo se realizará próximamente entre los participantes."
                : `Faltan ${giveaway.targetFollowers - currentFollowers} seguidores para activar el sorteo.`
              }
            </p>
          </div>

          {/* Requirement */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h4 className="font-semibold text-foreground mb-2">Requisito para participar:</h4>
            <div className="flex items-center gap-3">
              <Instagram className="w-5 h-5 text-morfika-glow" />
              <span className="text-muted-foreground">Seguir a @morfika3d en Instagram</span>
            </div>
          </div>

          {/* CTA */}
          <a
            href="https://instagram.com/morfika3d"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow w-full mt-6 py-3 rounded-lg font-semibold text-center flex items-center justify-center gap-2"
          >
            <Instagram className="w-5 h-5" />
            Seguir en Instagram
          </a>
        </div>
      </div>
    </div>
  );
};

export default GiveawayModal;
