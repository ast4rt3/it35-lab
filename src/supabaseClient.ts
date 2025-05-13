import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment variables:', {
  url: supabaseUrl ? 'Present' : 'Missing',
  key: supabaseAnonKey ? 'Present' : 'Missing'
});

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Please check your .env file.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 