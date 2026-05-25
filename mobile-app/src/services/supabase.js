import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Gisenyi Gadgets] Missing Supabase environment variables. ' +
    'Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // On web: detect tokens from URL after OAuth redirect
      // On native: handled manually via deep-link in AuthContext
      detectSessionInUrl: Platform.OS === 'web',
      storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
      // Suppress noisy token refresh errors - handled by AuthContext
      debug: false,
    },
    global: {
      headers: { 'x-client-info': 'gisenyi-gadgets-mobile' },
    },
  }
);
