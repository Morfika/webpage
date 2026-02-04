import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getRaffles, getGiveaways, type Raffle, type Giveaway } from "@/lib/data";
import { getInstagramFollowers } from "@/lib/instagram";
import { Gift, Instagram, Ticket, Calendar } from "lucide-react";
import RaffleModal from "@/components/RaffleModal";
import GiveawayModal from "@/components/GiveawayModal";

const Sorteos = () => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [instagramFollowers, setInstagramFollowers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rafflesData, giveawaysData, followers] = await Promise.all([
        getRaffles(),
        getGiveaways(),
        getInstagramFollowers()
      ]);
      setRaffles(rafflesData);
      setGiveaways(giveawaysData);
      setInstagramFollowers(followers);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Sorteos & Rifas</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Participa en nuestros sorteos y rifas para ganar increíbles premios de impresión 3D.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          ) : (
            <>
              {/* Giveaways Section */}
              {giveaways.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-morfika-purple/20">
                      <Instagram className="w-5 h-5 text-morfika-glow" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Sorteos Activos</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {giveaways.map((giveaway) => (
                      <div
                        key={giveaway.id}
                        onClick={() => setSelectedGiveaway(giveaway)}
                        className="bg-card rounded-2xl overflow-hidden border border-border card-glow cursor-pointer group"
                      >
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          <img
                            src={giveaway.image}
                            alt={giveaway.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {giveaway.active && (
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-morfika-glow/90 text-xs font-medium text-white">
                              Activo
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 text-foreground">{giveaway.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{giveaway.description}</p>
                          
                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progreso</span>
                              <span className="text-morfika-glow font-medium">
                                {giveaway.currentFollowers}/{giveaway.targetFollowers} seguidores
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-morfika-purple to-morfika-glow transition-all"
                                style={{ width: `${(giveaway.currentFollowers / giveaway.targetFollowers) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Termina: {new Date(giveaway.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raffles Section */}
              {raffles.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-morfika-purple/20">
                      <Ticket className="w-5 h-5 text-morfika-glow" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Rifas Actuales</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {raffles.map((raffle) => {
                      const soldCount = raffle.numbers.filter(n => n.sold).length;
                      const availableCount = raffle.numbers.length - soldCount;

                      return (
                        <div
                          key={raffle.id}
                          onClick={() => setSelectedRaffle(raffle)}
                          className="bg-card rounded-2xl overflow-hidden border border-border card-glow cursor-pointer group"
                        >
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <img
                              src={raffle.image}
                              alt={raffle.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-morfika-purple/90 text-xs font-medium text-white">
                              ${raffle.price.toLocaleString()} c/u
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-2 text-foreground">{raffle.title}</h3>
                            <p className="text-muted-foreground text-sm mb-4">{raffle.description}</p>
                            
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">
                                <span className="text-morfika-glow font-medium">{availableCount}</span> disponibles
                              </span>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {new Date(raffle.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {raffles.length === 0 && giveaways.length === 0 && (
                <div className="text-center py-16">
                  <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No hay sorteos activos</h3>
                  <p className="text-muted-foreground">Vuelve pronto para participar en nuestros próximos sorteos.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Modals */}
      {selectedRaffle && (
        <RaffleModal raffle={selectedRaffle} onClose={() => setSelectedRaffle(null)} />
      )}
      {selectedGiveaway && (
        <GiveawayModal 
          giveaway={selectedGiveaway} 
          onClose={() => setSelectedGiveaway(null)}
          instagramFollowers={instagramFollowers}
        />
      )}
    </div>
  );
};

export default Sorteos;
