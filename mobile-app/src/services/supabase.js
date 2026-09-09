import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cysejrutcrfvopqjqknv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8';

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
