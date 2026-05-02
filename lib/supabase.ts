import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
        // Return a dummy client during build time if environment variables are missing
        // or throw error locally
        if (process.env.NODE_ENV === 'production') {
            console.warn('Supabase environment variables are missing during build');
            return null;
        }
        throw new Error('Supabase environment variables are missing');
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};
