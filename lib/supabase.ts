import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Cek apakah kredensial Supabase sudah dikonfigurasi secara riil
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseServiceRoleKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project-id')
);

if (!isSupabaseConfigured) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      'ℹ️ Mode Lokal Aktif: Supabase belum dikonfigurasi, sistem menggunakan Local Data Store bawaan (Seed 10 Fasilitas & 5 Laporan siap pakai).'
    );
  }
}

/**
 * Client Supabase dengan Service Role Key untuk operasi server-side.
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
