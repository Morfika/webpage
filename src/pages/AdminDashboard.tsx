import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  checkAuth, 
  logout,
  getProducts, 
  addProduct,
  updateProduct,
  deleteProduct as deleteProductDB,
  getRaffles,
  addRaffle,
  updateRaffle,
  deleteRaffle as deleteRaffleDB,
  updateRaffleNumber,
  addRaffleNumbers,
  getGiveaways,
  addGiveaway,
  updateGiveaway,
  deleteGiveaway as deleteGiveawayDB,
  type Product,
  type Raffle,
  type Giveaway
} from "@/lib/data";
import { getInstagramFollowers } from "@/lib/instagram";
import { uploadImage, deleteImage } from "@/lib/supabase";
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
  Save,
  Upload,
  Loader
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
  const [instagramFollowers, setInstagramFollowers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [editingGiveaway, setEditingGiveaway] = useState<Giveaway | null>(null);
  const [showRaffleNumbers, setShowRaffleNumbers] = useState<Raffle | null>(null);
  
  const [productImagePreview, setProductImagePreview] = useState<string>("");
  const [raffleImagePreview, setRaffleImagePreview] = useState<string>("");
  const [giveawayImagePreview, setGiveawayImagePreview] = useState<string>("");

  useEffect(() => {
    if (!checkAuth()) {
      navigate("/admin");
      return;
    }
    loadData();
    loadInstagramFollowers();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [productsData, rafflesData, giveawaysData] = await Promise.all([
        getProducts(),
        getRaffles(),
        getGiveaways()
      ]);
      setProducts(productsData);
      setRaffles(rafflesData);
      setGiveaways(giveawaysData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadInstagramFollowers = async () => {
    try {
      const followers = await getInstagramFollowers();
      setInstagramFollowers(followers);
    } catch (error) {
      console.error('Error loading Instagram followers:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  // Image upload handler
  const handleImageUpload = async (file: File, folder: 'products' | 'raffles' | 'giveaways', setPreview: (url: string) => void, setObject: (obj: any) => void, obj: any) => {
    try {
      setUploading(true);
      const imageUrl = await uploadImage(file, folder);
      
      if (imageUrl) {
        setPreview(imageUrl);
        setObject({ ...obj, image: imageUrl });
        toast({ title: "Imagen subida", description: "La imagen se guardó exitosamente" });
      } else {
        toast({ title: "Error", description: "No se pudo subir la imagen", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Error", description: "Error al subir la imagen", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Product handlers
  const saveProduct = async (product: Product) => {
    try {
      if (product.id && product.id !== "") {
        await updateProduct(product.id, product);
      } else {
        await addProduct(product);
      }
      toast({ title: "Producto guardado" });
      setEditingProduct(null);
      await loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ title: "Error", description: "No se pudo guardar el producto", variant: "destructive" });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteProductDB(id);
      toast({ title: "Producto eliminado" });
      await loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: "Error", description: "No se pudo eliminar el producto", variant: "destructive" });
    }
  };

  // Raffle handlers
  const saveRaffle = async (raffle: Raffle) => {
    try {
      if (raffle.id && raffle.id !== "") {
        await updateRaffle(raffle.id, raffle);
      } else {
        const newRaffle = await addRaffle(raffle);
        if (newRaffle) {
          await addRaffleNumbers(newRaffle.id, 100);
        }
      }
      toast({ title: "Rifa guardada" });
      setEditingRaffle(null);
      await loadData();
    } catch (error) {
      console.error('Error saving raffle:', error);
      toast({ title: "Error", description: "No se pudo guardar la rifa", variant: "destructive" });
    }
  };

  const deleteRaffle = async (id: string) => {
    try {
      await deleteRaffleDB(id);
      toast({ title: "Rifa eliminada" });
      await loadData();
    } catch (error) {
      console.error('Error deleting raffle:', error);
      toast({ title: "Error", description: "No se pudo eliminar la rifa", variant: "destructive" });
    }
  };

  const toggleRaffleNumber = async (raffleId: string, number: number, buyerName?: string, buyerPhone?: string) => {
    try {
      const raffle = raffles.find(r => r.id === raffleId);
      if (!raffle) return;

      const raffleNum = raffle.numbers.find(n => n.number === number);
      if (!raffleNum) return;

      const newSoldStatus = !raffleNum.sold;
      await updateRaffleNumber(raffleId, number, newSoldStatus, newSoldStatus ? (buyerName || raffleNum.buyerName) : undefined, newSoldStatus ? (buyerPhone || raffleNum.buyerPhone) : undefined);
      
      toast({ title: newSoldStatus ? "Número marcado como vendido" : "Número marcado como disponible" });
      await loadData();
      
      if (showRaffleNumbers) {
        const updated = raffles.find(r => r.id === raffleId);
        if (updated) setShowRaffleNumbers(updated);
      }
    } catch (error) {
      console.error('Error updating raffle number:', error);
      toast({ title: "Error", description: "No se pudo actualizar el número", variant: "destructive" });
    }
  };

  // Giveaway handlers
  const saveGiveaway = async (giveaway: Giveaway) => {
    try {
      if (giveaway.id && giveaway.id !== "") {
        await updateGiveaway(giveaway.id, giveaway);
      } else {
        await addGiveaway(giveaway);
      }
      toast({ title: "Sorteo guardado" });
      setEditingGiveaway(null);
      await loadData();
    } catch (error) {
      console.error('Error saving giveaway:', error);
      toast({ title: "Error", description: "No se pudo guardar el sorteo", variant: "destructive" });
    }
  };

  const deleteGiveaway = async (id: string) => {
    try {
      await deleteGiveawayDB(id);
      toast({ title: "Sorteo eliminado" });
      await loadData();
    } catch (error) {
      console.error('Error deleting giveaway:', error);
      toast({ title: "Error", description: "No se pudo eliminar el sorteo", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-5xl font-bold text-gradient tracking-wider font-jomhuria">MORFIKA Admin</span>
          </div>
          <div className="flex items-center gap-4">
            {instagramFollowers > 0 && (
              <div className="text-sm">
                <p className="text-muted-foreground">@dmorfika</p>
                <p className="text-lg font-semibold text-morfika-glow">{instagramFollowers.toLocaleString()} seguidores</p>
              </div>
            )}
            <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
        ) : (
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
                        ${raffle.price.toLocaleString()} - {raffle.numbers.filter(n => n.sold).length}/{raffle.numbers.length} vendidos
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
                  onClick={() => setEditingGiveaway({ id: "", title: "", description: "", image: "/placeholder.svg", instagramRequired: true, currentFollowers: instagramFollowers, targetFollowers: 1000, endDate: "", active: true })}
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
                        {instagramFollowers || giveaway.currentFollowers}/{giveaway.targetFollowers} seguidores
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
        )}
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal onClose={() => { setEditingProduct(null); setProductImagePreview(""); }}>
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
            
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Imagen del Producto</label>
              {(productImagePreview || editingProduct.image) && editingProduct.image !== "/placeholder.svg" && (
                <img src={productImagePreview || editingProduct.image} alt="preview" className="w-full h-32 rounded-lg object-cover bg-muted" />
              )}
              <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition">
                <Upload className="w-4 h-4" />
                <span className="text-sm">{uploading ? "Subiendo..." : "Selecciona imagen"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(e.target.files[0], 'products', setProductImagePreview, setEditingProduct, editingProduct);
                    }
                  }}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <Button type="submit" className="w-full btn-glow border-0" disabled={uploading}>
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
            
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Imagen de la Rifa</label>
              {(raffleImagePreview || editingRaffle.image) && editingRaffle.image !== "/placeholder.svg" && (
                <img src={raffleImagePreview || editingRaffle.image} alt="preview" className="w-full h-32 rounded-lg object-cover bg-muted" />
              )}
              <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition">
                <Upload className="w-4 h-4" />
                <span className="text-sm">{uploading ? "Subiendo..." : "Selecciona imagen"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(e.target.files[0], 'raffles', setRaffleImagePreview, setEditingRaffle, editingRaffle);
                    }
                  }}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <Button type="submit" className="w-full btn-glow border-0" disabled={uploading}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </form>
        </Modal>
      )}

      {/* Edit Giveaway Modal */}
      {editingGiveaway && (
        <Modal onClose={() => { setEditingGiveaway(null); setGiveawayImagePreview(""); }}>
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
            
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Imagen del Sorteo</label>
              {(giveawayImagePreview || editingGiveaway.image) && editingGiveaway.image !== "/placeholder.svg" && (
                <img src={giveawayImagePreview || editingGiveaway.image} alt="preview" className="w-full h-32 rounded-lg object-cover bg-muted" />
              )}
              <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition">
                <Upload className="w-4 h-4" />
                <span className="text-sm">{uploading ? "Subiendo..." : "Selecciona imagen"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(e.target.files[0], 'giveaways', setGiveawayImagePreview, setEditingGiveaway, editingGiveaway);
                    }
                  }}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <Button type="submit" className="w-full btn-glow border-0" disabled={uploading}>
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
          
          {/* Legend */}
          <div className="mb-6 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-morfika-purple/20 border border-morfika-purple/30" />
                <span className="text-sm text-foreground">Disponible</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-destructive/20 border border-destructive/30" />
                <span className="text-sm text-foreground">Vendido (click para cancelar)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-10 gap-2 max-h-[60vh] overflow-y-auto">
            {showRaffleNumbers.numbers.map((num) => (
              <button
                key={num.number}
                onClick={() => {
                  if (!num.sold) {
                    const buyerName = prompt("Nombre del comprador:");
                    if (buyerName) {
                      const buyerPhone = prompt("Teléfono del comprador:");
                      if (buyerPhone) {
                        toggleRaffleNumber(showRaffleNumbers.id, num.number, buyerName, buyerPhone);
                      }
                    }
                  } else {
                    const confirmCancel = confirm(
                      `¿Cancelar venta de #${num.number}?\n\nComprador: ${num.buyerName || "No especificado"}\nTeléfono: ${num.buyerPhone || "No especificado"}`
                    );
                    if (confirmCancel) {
                      toggleRaffleNumber(showRaffleNumbers.id, num.number);
                    }
                  }
                }}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all cursor-pointer ${
                  num.sold
                    ? "bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30"
                    : "bg-morfika-purple/20 text-morfika-glow border border-morfika-purple/30 hover:bg-morfika-purple/40"
                }`}
                title={num.sold ? `Vendido a: ${num.buyerName || "Desconocido"}\nTeléfono: ${num.buyerPhone || "No especificado"}` : "Disponible"}
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
