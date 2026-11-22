import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { isNeonConfigured, neonGetReportsByUserId } from '@/lib/neon';
import { getAuthUserFromRequest } from '@/lib/auth';
import { localStore } from '@/lib/localStore';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Sesi Anda tidak valid. Silakan login terlebih dahulu.',
        },
        { status: 401 }
      );
    }

    // 1. NEON POSTGRES
    if (isNeonConfigured) {
      const reports = await neonGetReportsByUserId(authUser.userId);
      return NextResponse.json(
        {
          success: true,
          data: reports,
          message: 'Daftar laporan milik Anda berhasil diambil (Neon Postgres).',
        },
        { status: 200 }
      );
    }

    // 2. SUPABASE POSTGRES
    if (isSupabaseConfigured) {
      const { data: reports, error } = await supabaseServer
        .from('reports')
        .select('*, facilities(id, name, building), users(id, name, email)')
        .eq('user_id', authUser.userId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { success: false, data: null, message: 'Gagal mengambil riwayat laporan Anda: ' + error.message },
          { status: 500 }
        );
      }

      const formattedReports = (reports || []).map((r: any) => ({
        ...r,
        facility_name: r.facilities?.name || 'Fasilitas Kampus',
        facility_building: r.facilities?.building || '',
        user_name: authUser.name,
      }));

      return NextResponse.json(
        {
          success: true,
          data: formattedReports,
          message: 'Daftar laporan milik Anda berhasil diambil (Supabase).',
        },
        { status: 200 }
      );
    }

    // 3. FALLBACK LOCAL STORE
    const reports = localStore.getReportsByUserId(authUser.userId);
    return NextResponse.json(
      {
        success: true,
        data: reports,
        message: 'Daftar laporan milik Anda berhasil diambil (mode lokal).',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: 'Terjadi kesalahan: ' + (error?.message || 'Internal Server Error'),
      },
      { status: 500 }
    );
  }
}
