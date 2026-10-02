import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing!');
    setTimeout(() => {
      Alert.alert(
        "Қосылым қатесі",
        "Сервермен байланыс орнату мүмкін болмады. Интернетті тексеріңіз немесе қосымшаны жаңартыңыз."
      );
    }, 2000);
    supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key');
  } else {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: { 'x-client-id': 'adam-zat-game' },
      },
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    });
  }
} catch (e) {
  console.error('Critical failure initializing Supabase client:', e);
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export const supabase = supabaseClient;
