import { supabase } from './supabase';

import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_INVITE_KEY = 'pending_invite_code';

export async function savePendingInvite(code: string) {
  try {
    await AsyncStorage.setItem(PENDING_INVITE_KEY, code);
  } catch (e) {
    console.error('Error saving pending invite:', e);
  }
}

export async function getPendingInvite(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PENDING_INVITE_KEY);
  } catch (e) {
    console.error('Error getting pending invite:', e);
    return null;
  }
}

export async function clearPendingInvite() {
  try {
    await AsyncStorage.removeItem(PENDING_INVITE_KEY);
  } catch (e) {
    console.error('Error clearing pending invite:', e);
  }
}

export async function uploadAvatar(userId: string, fileUri: string) {
// ... (previous implementation)

  try {
    // 1. File name generate (userId + timestamp)
    const fileExt = fileUri.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // 2. File-ды ArrayBuffer-ге айналдыру
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // 3. Supabase Storage-қа жүктеу
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 4. Public URL алу
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 5. Профильдегі avatar_url-ді жаңарту
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { publicUrl };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}
