import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '⚠️ SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi di file .env.local! Pastikan mengisi konfigurasi database Supabase.'
    );
  }
}

/**
 * Client Supabase dengan Service Role Key untuk operasi server-side (Route Handlers).
 * Memiliki akses penuh melewati RLS secara aman dari sisi server.
 */
export const supabaseServer = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
