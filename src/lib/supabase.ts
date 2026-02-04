import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============ IMAGE UPLOAD ============
export const uploadImage = async (file: File, folder: 'products' | 'raffles' | 'giveaways'): Promise<string | null> => {
  try {
    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${folder}/${timestamp}-${randomStr}-${file.name}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('morfika-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: publicUrl } = supabase.storage
      .from('morfika-images')
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extraer path del URL
    const urlParts = imageUrl.split('/');
    const filePath = urlParts.slice(-2).join('/');

    const { error } = await supabase.storage
      .from('morfika-images')
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
