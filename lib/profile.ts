import { supabase } from './supabase';

export type Profile = {
  id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  total_games: number;
  total_wins: number;
  total_score: number;
  created_at: string;
};

/**
 * Get the current authenticated user's profile
 */
export const getProfile = async (): Promise<Profile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

/**
 * Update the current user's profile information
 */
export const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'total_games' | 'total_wins' | 'total_score'>>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }
};
