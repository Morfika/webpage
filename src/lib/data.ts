import { supabase } from './supabase';
import { login as authLogin, checkAuth as authCheckAuth, logout as authLogout } from './auth';

// ============ UTILITY FUNCTIONS ============
/**
 * Genera un código único de 4 dígitos para un número de boleta vendido
 * Formato: XX.YY donde XX = número con padding (00-99) e YY = aleatorio (00-99)
 * Ejemplo: número 7 con aleatorio 23 = "0723"
 */
export const generateBuyerCode = (number: number): string => {
  const paddedNumber = String(number).padStart(2, '0');
  const randomPart = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return `${paddedNumber}${randomPart}`;
};

// ============ INTERFACES ============
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Raffle {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  endDate: string;
  numbers: RaffleNumber[];
}

export interface RaffleNumber {
  number: number;
  sold: boolean;
  paid?: boolean;
  buyerName?: string;
  buyerPhone?: string;
  buyerCode?: string;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  image: string;
  instagramRequired: boolean;
  currentFollowers: number;
  targetFollowers: number;
  endDate: string;
  active: boolean;
}

export interface Printer {
  id: string;
  name: string;
  image: string;
  materials: string[];
  dimensions: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  description: string;
}

// ============ PRODUCTOS ============
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

export const saveProducts = async (products: Product[]) => {
  return true;
};

// ============ BUYER CODE FUNCTIONS ============
/**
 * Obtiene todos los códigos existentes de una rifa para evitar duplicados
 */
const getExistingCodes = async (raffleId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('raffle_numbers')
      .select('buyer_code')
      .eq('raffle_id', raffleId)
      .not('buyer_code', 'is', null);

    if (error) throw error;
    return data?.map(r => r.buyer_code) || [];
  } catch (error) {
    console.error('Error getting existing codes:', error);
    return [];
  }
};

/**
 * Genera un código único que no exista en la rifa
 */
export const generateUniqueBuyerCode = async (raffleId: string, number: number): Promise<string> => {
  const existingCodes = await getExistingCodes(raffleId);
  const paddedNumber = String(number).padStart(2, '0');
  
  let newCode = generateBuyerCode(number);
  // Si el código ya existe, intenta generar otro
  while (existingCodes.includes(newCode)) {
    newCode = `${paddedNumber}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
  }
  
  return newCode;
};

// ============ RIFAS ============
export const getRaffles = async (): Promise<Raffle[]> => {
  try {
    const { data: rafflesData, error: rafflesError } = await supabase
      .from('raffles')
      .select('*')
      .order('created_at', { ascending: false });

    if (rafflesError) throw rafflesError;

    const raffles: Raffle[] = [];

    for (const raffle of rafflesData || []) {
      const { data: numbersData, error: numbersError } = await supabase
        .from('raffle_numbers')
        .select('*')
        .eq('raffle_id', raffle.id)
        .order('number', { ascending: true });

      if (numbersError) throw numbersError;

      raffles.push({
        id: raffle.id,
        title: raffle.title,
        description: raffle.description,
        image: raffle.image,
        price: raffle.price,
        endDate: raffle.end_date,
        numbers: numbersData?.map(n => ({
          number: n.number,
          sold: n.sold,
          paid: n.paid,
          buyerName: n.buyer_name,
          buyerPhone: n.buyer_phone,
          buyerCode: n.buyer_code
        })) || []
      });
    }

    return raffles;
  } catch (error) {
    console.error('Error fetching raffles:', error);
    return [];
  }
};

export const addRaffle = async (raffle: Omit<Raffle, 'id' | 'numbers'>): Promise<Raffle | null> => {
  try {
    const { data, error } = await supabase
      .from('raffles')
      .insert([{
        title: raffle.title,
        description: raffle.description,
        image: raffle.image,
        price: raffle.price,
        end_date: raffle.endDate
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      endDate: data.end_date,
      numbers: []
    };
  } catch (error) {
    console.error('Error adding raffle:', error);
    return null;
  }
};

export const updateRaffle = async (id: string, updates: Partial<Raffle>): Promise<Raffle | null> => {
  try {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.image) updateData.image = updates.image;
    if (updates.price) updateData.price = updates.price;
    if (updates.endDate) updateData.end_date = updates.endDate;

    const { data, error } = await supabase
      .from('raffles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const { data: numbersData } = await supabase
      .from('raffle_numbers')
      .select('*')
      .eq('raffle_id', id);

    return {
      ...data,
      endDate: data.end_date,
      numbers: numbersData?.map(n => ({
        number: n.number,
        sold: n.sold,
        paid: n.paid,
        buyerName: n.buyer_name,
        buyerPhone: n.buyer_phone,
        buyerCode: n.buyer_code
      })) || []
    };
  } catch (error) {
    console.error('Error updating raffle:', error);
    return null;
  }
};

export const deleteRaffle = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting raffle:', error);
    return false;
  }
};

export const updateRaffleNumber = async (raffleId: string, number: number, sold: boolean, buyerName?: string, buyerPhone?: string, buyerCode?: string, paid?: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('raffle_numbers')
      .update({
        sold,
        paid,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        buyer_code: buyerCode
      })
      .eq('raffle_id', raffleId)
      .eq('number', number);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating raffle number:', error);
    return false;
  }
};

export const addRaffleNumbers = async (raffleId: string, count: number): Promise<boolean> => {
  try {
    const numbers = Array.from({ length: count }, (_, i) => ({
      raffle_id: raffleId,
      number: i + 1,
      sold: false
    }));

    const { error } = await supabase
      .from('raffle_numbers')
      .insert(numbers);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding raffle numbers:', error);
    return false;
  }
};

export const saveRaffles = async (raffles: Raffle[]) => {
  return true;
};

// ============ SORTEOS/GIVEAWAYS ============
export const getGiveaways = async (): Promise<Giveaway[]> => {
  try {
    const { data, error } = await supabase
      .from('giveaways')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      image: g.image,
      instagramRequired: g.instagram_required,
      currentFollowers: g.current_followers || 0,
      targetFollowers: g.target_followers,
      endDate: g.end_date,
      active: g.active
    }));
  } catch (error) {
    console.error('Error fetching giveaways:', error);
    return [];
  }
};

export const addGiveaway = async (giveaway: Omit<Giveaway, 'id'>): Promise<Giveaway | null> => {
  try {
    const { data, error } = await supabase
      .from('giveaways')
      .insert([{
        title: giveaway.title,
        description: giveaway.description,
        image: giveaway.image,
        instagram_required: giveaway.instagramRequired,
        target_followers: giveaway.targetFollowers,
        end_date: giveaway.endDate,
        active: giveaway.active
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      instagramRequired: data.instagram_required,
      currentFollowers: data.current_followers || 0,
      targetFollowers: data.target_followers,
      endDate: data.end_date
    };
  } catch (error) {
    console.error('Error adding giveaway:', error);
    return null;
  }
};

export const updateGiveaway = async (id: string, updates: Partial<Giveaway>): Promise<Giveaway | null> => {
  try {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.image) updateData.image = updates.image;
    if (updates.instagramRequired !== undefined) updateData.instagram_required = updates.instagramRequired;
    if (updates.currentFollowers !== undefined) updateData.current_followers = updates.currentFollowers;
    if (updates.targetFollowers !== undefined) updateData.target_followers = updates.targetFollowers;
    if (updates.endDate) updateData.end_date = updates.endDate;
    if (updates.active !== undefined) updateData.active = updates.active;

    const { data, error } = await supabase
      .from('giveaways')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      instagramRequired: data.instagram_required,
      currentFollowers: data.current_followers || 0,
      targetFollowers: data.target_followers,
      endDate: data.end_date
    };
  } catch (error) {
    console.error('Error updating giveaway:', error);
    return null;
  }
};

export const deleteGiveaway = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('giveaways')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting giveaway:', error);
    return false;
  }
};

// ============ PRINTERS & GALLERY (localStorage) ============
const defaultPrinters: Printer[] = [
  {
    id: "1",
    name: "Creality Ender 3 V3 KE",
    image: "/assets/ender3v3ke.png",
    materials: ["PLA", "PETG", "TPU"],
    dimensions: "220 x 220 x 240 mm",
    description: "Impresora FDM rápida con extrusor directo, nivelación automática CR-Touch y firmware Klipper"
  },
  {
    id: "2",
    name: "Anycubic Kobra 2 Max",
    image: "/assets/anycubickobra2max.png",
    materials: ["PLA", "ABS", "PETG", "TPU", "Nylon"],
    dimensions: "420 x 420 x 500 mm",
    description: "Impresora FDM de gran formato con sistema LeviQ 2.0, alta velocidad y cama magnética PEI"
  },
  {
    id: "3",
    name: "Creality CR-10 SE",
    image: "/assets/cr10se.png",
    materials: ["PLA", "PETG", "TPU", "ABS", "Nylon"],
    dimensions: "300 x 300 x 400 mm",
    description: "Impresora FDM con extrusor directo Sprite, nivelación automática y alto rendimiento para piezas grandes"
  },
  {
    id: "4",
    name: "Anycubic Photon Mono X2",
    image: "/assets/photonmonox2.png",
    materials: ["Resina estándar", "Resina ABS-like", "Resina flexible", "Resina lavable en agua"],
    dimensions: "196 x 122 x 200 mm",
    description: "Impresora 3D de resina con pantalla monocromática 4K, alta precisión y excelente detalle en miniaturas"
  },
  {
    id: "5",
    name: "Bambu Lab A1 Combo",
    image: "/assets/A1combo.png",
    materials: ["PLA", "PETG", "TPU", "ABS", "ASA", "Nylon"],
    dimensions: "256 x 256 x 256 mm",
    description: "Impresora FDM de alta velocidad con sistema AMS Lite para impresión multicolor, nivelación automática y excelente calidad desde fábrica"
  },
  {
    id: "6",
    name: "Elegoo Centauri Carbon",
    image: "/assets/centauricarbon.png",
    materials: ["PLA", "PETG", "TPU", "ABS", "ASA", "Nylon", "Fibra de carbono"],
    dimensions: "320 x 320 x 400 mm",
    description: "Impresora FDM de gran formato con estructura reforzada, hotend de alta temperatura y compatibilidad con filamentos técnicos"
  }
];


const defaultGallery: GalleryItem[] = [
  { id: "1", image: "/assets/gallery-1.png", title: "Calavera Voronoi", description: "Impresión artística con estilo Voronoi" },
  { id: "2", image: "/assets/gallery-2.png", title: "Torre Eiffel", description: "Réplica arquitectónica de precisión detallada" },
  { id: "3", image: "/assets/gallery-3.png", title: "Gato Decorativo", description: "Gato artístico y decorativo con acabado profesional" },
  { id: "4", image: "/assets/gallery-4.png", title: "Robot Ackerman", description: "Modelo impreso con piezas funcionales ensamblables" },
  { id: "5", image: "/assets/gallery-5.png", title: "Ajedrez Personalizado", description: "Set de ajedrez 3D personalizado con detalles precisos" },
  { id: "6", image: "/assets/gallery-6.png", title: "Conjunto Decorativo Detalle", description: "Cuadro y accesorios personalizados, ideales para obsequios" },
  { id: "7", image: "/assets/gallery-7.png", title: "Gatos B&W con Llaveros", description: "Dos gatos blanco y negro con detalles finos y llaveros personalizados" },
  { id: "8", image: "/assets/gallery-8.png", title: "Toros Personalizados", description: "Figuras de toros impresos con detalles y acabados personalizables" }
];

export const getPrinters = (): Printer[] => {
  const stored = localStorage.getItem('morfika_printers');
  return stored ? JSON.parse(stored) : defaultPrinters;
};

export const savePrinters = (printers: Printer[]) => {
  localStorage.setItem('morfika_printers', JSON.stringify(printers));
};

export const getGallery = (): GalleryItem[] => {
  const stored = localStorage.getItem('morfika_gallery');
  return stored ? JSON.parse(stored) : defaultGallery;
};

export const saveGallery = (gallery: GalleryItem[]) => {
  localStorage.setItem('morfika_gallery', JSON.stringify(gallery));
};

// ============ AUTH (delegated to auth.ts) ============
export const checkAuth = (): boolean => authCheckAuth();
export const login = (password: string): boolean => authLogin(password);
export const logout = () => authLogout();
