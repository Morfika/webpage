// Mock data storage using localStorage

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

// Default data
const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Llavero Personalizado",
    description: "Llavero impreso en 3D con diseño personalizado",
    price: 15000,
    image: "/placeholder.svg",
    category: "Accesorios"
  },
  {
    id: "2",
    name: "Maceta Geométrica",
    description: "Maceta decorativa con diseño geométrico moderno",
    price: 35000,
    image: "/placeholder.svg",
    category: "Hogar"
  },
  {
    id: "3",
    name: "Soporte Celular",
    description: "Soporte ergonómico para smartphone",
    price: 25000,
    image: "/placeholder.svg",
    category: "Tech"
  }
];

const defaultRaffles: Raffle[] = [
  {
    id: "1",
    title: "Baby Groot Edición Especial",
    description: "Figura de Baby Groot de 20cm pintada a mano",
    image: "/placeholder.svg",
    price: 5000,
    endDate: "2025-03-01",
    numbers: Array.from({ length: 100 }, (_, i) => ({
      number: i + 1,
      sold: [3, 7, 15, 22, 45, 67, 89].includes(i + 1),
      buyerName: [3, 7, 15, 22, 45, 67, 89].includes(i + 1) ? "Comprador" : undefined
    }))
  }
];

const defaultGiveaways: Giveaway[] = [
  {
    id: "1",
    title: "Sorteo Dragon Ball",
    description: "Participa siguiéndonos en Instagram",
    image: "/placeholder.svg",
    instagramRequired: true,
    currentFollowers: 850,
    targetFollowers: 1000,
    endDate: "2025-02-28",
    active: true
  }
];

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

// Storage functions
export const getProducts = (): Product[] => {
  const stored = localStorage.getItem('morfika_products');
  return stored ? JSON.parse(stored) : defaultProducts;
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem('morfika_products', JSON.stringify(products));
};

export const getRaffles = (): Raffle[] => {
  const stored = localStorage.getItem('morfika_raffles');
  return stored ? JSON.parse(stored) : defaultRaffles;
};

export const saveRaffles = (raffles: Raffle[]) => {
  localStorage.setItem('morfika_raffles', JSON.stringify(raffles));
};

export const getGiveaways = (): Giveaway[] => {
  const stored = localStorage.getItem('morfika_giveaways');
  return stored ? JSON.parse(stored) : defaultGiveaways;
};

export const saveGiveaways = (giveaways: Giveaway[]) => {
  localStorage.setItem('morfika_giveaways', JSON.stringify(giveaways));
};

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

// Auth
export const checkAuth = (): boolean => {
  return localStorage.getItem('morfika_auth') === 'true';
};

export const login = (password: string): boolean => {
  if (password === '#morfika202519185311') {
    localStorage.setItem('morfika_auth', 'true');
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem('morfika_auth');
};
