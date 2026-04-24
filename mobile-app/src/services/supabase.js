import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdsaemjngaamvgjlooyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2FlbWpuZ2FhbXZnamxvb3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODI3NjcsImV4cCI6MjA5MjU1ODc2N30.zFgCoZs4R_gT5cGiQA2WLn9fUuzIcogUkWOy3A1WtwI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: localStorage, // For web
  },
  global: {
    headers: { 'x-client-info': 'gisenyi-gadgets-mobile' },
  },
});
