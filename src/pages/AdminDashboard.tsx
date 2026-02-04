import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  checkAuth, 
  logout,
  getProducts, 
  saveProducts,
  getRaffles,
  saveRaffles,
  getGiveaways,
  saveGiveaways,
  type Product,
  type Raffle,
  type Giveaway
} from "@/lib/data";
import { 
  Printer, 
  LogOut, 
  Package, 
  Ticket, 
  Gift, 
  Plus,
  Trash2,
  Edit,
  X,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [editingGiveaway, setEditingGiveaway] = useState<Giveaway | null>(null);
  const [showRaffleNumbers, setShowRaffleNumbers] = useState<Raffle | null>(null);

  useEffect(() => {
    if (!checkAuth()) {
      navigate("/admin");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = () => {
    setProducts(getProducts());
    setRaffles(getRaffles());
    setGiveaways(getGiveaways());
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  // Product handlers
  const saveProduct = (product: Product) => {
    const updated = product.id 
      ? products.map(p => p.id === product.id ? product : p)
      : [...products, { ...product, id: Date.now().toString() }];
    setProducts(updated);
    saveProducts(updated);
    setEditingProduct(null);
    toast({ title: "Producto guardado" });
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
    toast({ title: "Producto eliminado" });
  };

  // Raffle handlers
  const saveRaffle = (raffle: Raffle) => {
    let updatedRaffle = raffle;
    if (!raffle.id) {
      updatedRaffle = {
        ...raffle,
        id: Date.now().toString(),
        numbers: Array.from({ length: 100 }, (_, i) => ({
          number: i + 1,
          sold: false
        }))
      };
    }
    const updated = raffle.id 
      ? raffles.map(r => r.id === raffle.id ? updatedRaffle : r)
      : [...raffles, updatedRaffle];
    setRaffles(updated);
    saveRaffles(updated);
    setEditingRaffle(null);
    toast({ title: "Rifa guardada" });
  };

  const deleteRaffle = (id: string) => {
    const updated = raffles.filter(r => r.id !== id);
    setRaffles(updated);
    saveRaffles(updated);
    toast({ title: "Rifa eliminada" });
  };

  const toggleRaffleNumber = (raffleId: string, number: number, buyerName?: string) => {
    const updated = raffles.map(r => {
      if (r.id === raffleId) {
        return {
          ...r,
          numbers: r.numbers.map(n => 
            n.number === number 
              ? { ...n, sold: !n.sold, buyerName: n.sold ? undefined : buyerName }
              : n
          )
        };
      }
      return r;
    });
    setRaffles(updated);
    saveRaffles(updated);
    if (showRaffleNumbers) {
      setShowRaffleNumbers(updated.find(r => r.id === raffleId) || null);
    }
  };

  // Giveaway handlers
  const saveGiveaway = (giveaway: Giveaway) => {
    const updated = giveaway.id 
      ? giveaways.map(g => g.id === giveaway.id ? giveaway : g)
      : [...giveaways, { ...giveaway, id: Date.now().toString() }];
    setGiveaways(updated);
    saveGiveaways(updated);
    setEditingGiveaway(null);
    toast({ title: "Sorteo guardado" });
  };

  const deleteGiveaway = (id: string) => {
    const updated = giveaways.filter(g => g.id !== id);
    setGiveaways(updated);
    saveGiveaways(updated);
    toast({ title: "Sorteo eliminado" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-5xl font-bold text-gradient tracking-wider  font-jomhuria text-gradient
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:text-transparent
              group-hover:bg-clip-text
              group-hover:bg-gradient-to-r
              group-hover:from-morfika-purple
              group-hover:to-morfika-glow">MORFIKA Admin</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="products" className="data-[state=active]:bg-morfika-purple/20">
              <Package className="w-4 h-4 mr-2" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="raffles" className="data-[state=active]:bg-morfika-purple/20">
              <Ticket className="w-4 h-4 mr-2" />
              Rifas
            </TabsTrigger>
            <TabsTrigger value="giveaways" className="data-[state=active]:bg-morfika-purple/20">
              <Gift className="w-4 h-4 mr-2" />
              Sorteos
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Productos</h2>
              <Button 
                onClick={() => setEditingProduct({ id: "", name: "", description: "", price: 0, image: "/placeholder.svg", category: "" })}
                className="btn-glow border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>

            <div className="grid gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover bg-muted" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category} - ${product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Raffles Tab */}
          <TabsContent value="raffles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Rifas</h2>
              <Button 
                onClick={() => setEditingRaffle({ id: "", title: "", description: "", image: "/placeholder.svg", price: 0, endDate: "", numbers: [] })}
                className="btn-glow border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Rifa
              </Button>
            </div>

            <div className="grid gap-4">
              {raffles.map(raffle => (
                <div key={raffle.id} className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
                  <img src={raffle.image} alt={raffle.title} className="w-16 h-16 rounded-lg object-cover bg-muted" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{raffle.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${raffle.price.toLocaleString()} - {raffle.numbers.filter(n => n.sold).length}/100 vendidos
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowRaffleNumbers(raffle)}>
                      Ver Números
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingRaffle(raffle)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteRaffle(raffle.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Giveaways Tab */}
          <TabsContent value="giveaways" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Sorteos</h2>
              <Button 
                onClick={() => setEditingGiveaway({ id: "", title: "", description: "", image: "/placeholder.svg", instagramRequired: true, currentFollowers: 0, targetFollowers: 1000, endDate: "", active: true })}
                className="btn-glow border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Sorteo
              </Button>
            </div>

            <div className="grid gap-4">
              {giveaways.map(giveaway => (
                <div key={giveaway.id} className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
                  <img src={giveaway.image} alt={giveaway.title} className="w-16 h-16 rounded-lg object-cover bg-muted" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{giveaway.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {giveaway.currentFollowers}/{giveaway.targetFollowers} seguidores
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingGiveaway(giveaway)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteGiveaway(giveaway.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal onClose={() => setEditingProduct(null)}>
          <h3 className="text-xl font-bold mb-4">{editingProduct.id ? "Editar" : "Nuevo"} Producto</h3>
          <form onSubmit={(e) => { e.preventDefault(); saveProduct(editingProduct); }} className="space-y-4">
            <Input
              placeholder="Nombre"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              required
            />
            <Textarea
              placeholder="Descripción"
              value={editingProduct.description}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
            />
            <Input
              placeholder="Categoría"
              value={editingProduct.category}
              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Precio"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
              required
            />
            <Input
              placeholder="URL de imagen"
              value={editingProduct.image}
              onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
            />
            <Button type="submit" className="w-full btn-glow border-0">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </form>
        </Modal>
      )}

      {/* Edit Raffle Modal */}
      {editingRaffle && (
        <Modal onClose={() => setEditingRaffle(null)}>
          <h3 className="text-xl font-bold mb-4">{editingRaffle.id ? "Editar" : "Nueva"} Rifa</h3>
          <form onSubmit={(e) => { e.preventDefault(); saveRaffle(editingRaffle); }} className="space-y-4">
            <Input
              placeholder="Título"
              value={editingRaffle.title}
              onChange={(e) => setEditingRaffle({ ...editingRaffle, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Descripción"
              value={editingRaffle.description}
              onChange={(e) => setEditingRaffle({ ...editingRaffle, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Precio por número"
              value={editingRaffle.price}
              onChange={(e) => setEditingRaffle({ ...editingRaffle, price: Number(e.target.value) })}
              required
            />
            <Input
              type="date"
              placeholder="Fecha de cierre"
              value={editingRaffle.endDate}
              onChange={(e) => setEditingRaffle({ ...editingRaffle, endDate: e.target.value })}
            />
            <Input
              placeholder="URL de imagen"
              value={editingRaffle.image}
              onChange={(e) => setEditingRaffle({ ...editingRaffle, image: e.target.value })}
            />
            <Button type="submit" className="w-full btn-glow border-0">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </form>
        </Modal>
      )}

      {/* Edit Giveaway Modal */}
      {editingGiveaway && (
        <Modal onClose={() => setEditingGiveaway(null)}>
          <h3 className="text-xl font-bold mb-4">{editingGiveaway.id ? "Editar" : "Nuevo"} Sorteo</h3>
          <form onSubmit={(e) => { e.preventDefault(); saveGiveaway(editingGiveaway); }} className="space-y-4">
            <Input
              placeholder="Título"
              value={editingGiveaway.title}
              onChange={(e) => setEditingGiveaway({ ...editingGiveaway, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Descripción"
              value={editingGiveaway.description}
              onChange={(e) => setEditingGiveaway({ ...editingGiveaway, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Seguidores actuales"
              value={editingGiveaway.currentFollowers}
              onChange={(e) => setEditingGiveaway({ ...editingGiveaway, currentFollowers: Number(e.target.value) })}
            />
            <Input
              type="number"
              placeholder="Meta de seguidores"
              value={editingGiveaway.targetFollowers}
              onChange={(e) => setEditingGiveaway({ ...editingGiveaway, targetFollowers: Number(e.target.value) })}
            />
            <Input
              type="date"
              placeholder="Fecha de cierre"
              value={editingGiveaway.endDate}
              onChange={(e) => setEditingGiveaway({ ...editingGiveaway, endDate: e.target.value })}
            />
            <Input
              placeholder="URL de imagen"
              value={editingGiveaway.image}
              onChange={(e) => setEditingGiveaway({ ...editingGiveaway, image: e.target.value })}
            />
            <Button type="submit" className="w-full btn-glow border-0">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </form>
        </Modal>
      )}

      {/* Raffle Numbers Modal */}
      {showRaffleNumbers && (
        <Modal onClose={() => setShowRaffleNumbers(null)} wide>
          <h3 className="text-xl font-bold mb-4">Números: {showRaffleNumbers.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Haz clic en un número para marcarlo como vendido/disponible
          </p>
          <div className="grid grid-cols-10 gap-2 max-h-[60vh] overflow-y-auto">
            {showRaffleNumbers.numbers.map((num) => (
              <button
                key={num.number}
                onClick={() => {
                  if (!num.sold) {
                    const buyerName = prompt("Nombre del comprador:");
                    if (buyerName) {
                      toggleRaffleNumber(showRaffleNumbers.id, num.number, buyerName);
                    }
                  } else {
                    toggleRaffleNumber(showRaffleNumbers.id, num.number);
                  }
                }}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all ${
                  num.sold
                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                    : "bg-morfika-purple/20 text-morfika-glow border border-morfika-purple/30 hover:bg-morfika-purple/40"
                }`}
                title={num.sold ? `Vendido a: ${num.buyerName}` : "Disponible"}
              >
                {num.number}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

// Modal component
const Modal = ({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
    <div 
      className={`bg-card rounded-2xl border border-border p-6 shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-md'} w-full max-h-[90vh] overflow-y-auto`}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg">
        <X className="w-5 h-5" />
      </button>
      {children}
    </div>
  </div>
);

export default AdminDashboard;
