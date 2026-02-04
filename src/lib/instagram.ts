import { supabase } from './supabase';

export interface InstagramData {
  followers: number;
  username: string;
  lastUpdated: Date;
}

// Obtener followers de Instagram usando Meta Business API
export const getInstagramFollowers = async (): Promise<number> => {
  try {
    const accessToken = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;
    const businessAccountId = import.meta.env.VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!accessToken || !businessAccountId) {
      console.warn('Instagram API credentials not configured');
      // Obtener del cache en Supabase
      return await getCachedFollowers();
    }

    // Llamar a Meta Business API
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${businessAccountId}?fields=ig_username,followers_count&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram data');
    }

    const data = await response.json();
    const followers = data.followers_count || 0;

    // Guardar en Supabase
    await updateFollowersCache(followers);

    return followers;
  } catch (error) {
    console.error('Error fetching Instagram followers:', error);
    // En caso de error, retornar valor en cache
    return await getCachedFollowers();
  }
};

// Obtener followers del cache en Supabase
const getCachedFollowers = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('last_followers_count')
      .eq('instagram_username', '@dmorfika')
      .single();

    if (error) throw error;
    return data?.last_followers_count || 0;
  } catch (error) {
    console.error('Error getting cached followers:', error);
    return 0;
  }
};

// Actualizar cache de followers
const updateFollowersCache = async (followers: number) => {
  try {
    await supabase
      .from('config')
      .update({
        last_followers_count: followers,
        last_updated: new Date().toISOString()
      })
      .eq('instagram_username', '@dmorfika');
  } catch (error) {
    console.error('Error updating followers cache:', error);
  }
};

// Obtener datos completos de Instagram
export const getInstagramData = async (): Promise<InstagramData> => {
  const followers = await getInstagramFollowers();
  return {
    followers,
    username: '@dmorfika',
    lastUpdated: new Date()
  };
};
