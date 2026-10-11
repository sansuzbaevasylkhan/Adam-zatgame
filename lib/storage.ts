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
  try {
    // 1. File name generate
    const fileExt = fileUri.split('.').pop() || 'jpg';
    const fileName = `${userId}.${fileExt}`; // Use stable name for easier replacement
    const filePath = `avatars/${fileName}`;

    // 2. React Native-те blob() кейде дұрыс жұмыс істемеуі мүмкін
    // Сондықтан base64 арқылы жіберу сенімдірек
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Content-type анықтау
    const contentType = blob.type || 'image/jpeg';

    // 3. Supabase Storage-қа жүктеу
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase Storage Error:', uploadError);
      throw uploadError;
    }

    // 4. Public URL алу
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 5. Профильдегі avatar_url-ді жаңарту
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Profile Update Error:', updateError);
      throw updateError;
    }

    return { publicUrl };
  } catch (error: any) {
    console.error('Detailed Avatar Upload Error:', {
      message: error.message,
      status: error.status,
      details: error.details,
    });
    throw error;
  }
}
