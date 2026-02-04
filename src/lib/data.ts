import { supabase } from './supabase';
import { login as authLogin, checkAuth as authCheckAuth, logout as authLogout } from './auth';

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
  buyerName?: string;
  buyerPhone?: string;
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
          buyerName: n.buyer_name,
          buyerPhone: n.buyer_phone
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
        buyerName: n.buyer_name,
        buyerPhone: n.buyer_phone
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

export const updateRaffleNumber = async (raffleId: string, number: number, sold: boolean, buyerName?: string, buyerPhone?: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('raffle_numbers')
      .update({
        sold,
        buyer_name: buyerName,
        buyer_phone: buyerPhone
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
    name: "Ender 3 V2",
    image: "/placeholder.svg",
    materials: ["PLA", "PETG", "TPU"],
    dimensions: "220 x 220 x 250 mm",
    description: "Impresora FDM de alta precisión"
  },
  {
    id: "2",
    name: "Artillery Sidewinder X2",
    image: "/placeholder.svg",
    materials: ["PLA", "ABS", "PETG", "TPU", "Nylon"],
    dimensions: "300 x 300 x 400 mm",
    description: "Gran volumen de impresión"
  }
];

const defaultGallery: GalleryItem[] = [
  { id: "1", image: "/placeholder.svg", title: "Figuras Anime", description: "Colección de figuras anime" },
  { id: "2", image: "/placeholder.svg", title: "Piezas Mecánicas", description: "Prototipado industrial" },
  { id: "3", image: "/placeholder.svg", title: "Arte Decorativo", description: "Esculturas y arte" },
  { id: "4", image: "/placeholder.svg", title: "Accesorios Gaming", description: "Para tu setup" }
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
