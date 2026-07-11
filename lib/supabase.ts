import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createBrowserClient(url, anonKey);
};

export const getServiceSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_buLvfwp0kO0LwZfszswvPQ_74pQEK0I";
  return createClient(url, serviceKey);
};

