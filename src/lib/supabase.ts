import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Hardcoded fallback for when env vars aren't loaded properly
// This is the Lovable Cloud project configuration
const FALLBACK_SUPABASE_URL = 'https://tzhxfpcoeaqadynzjjsh.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aHhmcGNvZWFxYWR5bnpqanNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NTY0NjAsImV4cCI6MjA3NTAzMjQ2MH0.esCRM0ZbQMqZmTtq2y2VTzZfmmXW2Q6pR0FiWOykvuw';

const getSupabaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl && envUrl !== 'undefined' && !envUrl.includes('localhost.invalid')) {
    return envUrl;
  }
  return FALLBACK_SUPABASE_URL;
};

const getSupabaseKey = (): string => {
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (envKey && envKey !== 'undefined' && envKey !== 'public-anon-key') {
    return envKey;
  }
  return FALLBACK_SUPABASE_ANON_KEY;
};

export const supabaseClient: SupabaseClient<Database> = createClient<Database>(
  getSupabaseUrl(),
  getSupabaseKey(),
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export default supabaseClient;
