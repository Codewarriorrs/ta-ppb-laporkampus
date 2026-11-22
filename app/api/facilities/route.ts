import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { isNeonConfigured, neonGetFacilities } from '@/lib/neon';
import { localStore } from '@/lib/localStore';

export async function GET() {
  try {
    // 1. NEON POSTGRES
    if (isNeonConfigured) {
      const facilities = await neonGetFacilities();
      return NextResponse.json(
        {
          success: true,
          data: facilities,
          message: 'Daftar fasilitas berhasil diambil (Neon Postgres).',
        },
        { status: 200 }
      );
    }

    // 2. SUPABASE POSTGRES
    if (isSupabaseConfigured) {
      const { data: facilities, error: facError } = await supabaseServer
        .from('facilities')
        .select('*')
        .order('name', { ascending: true });

      if (facError) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: 'Gagal mengambil data fasilitas: ' + facError.message,
          },
          { status: 500 }
        );
      }

      const { data: reports } = await supabaseServer.from('reports').select('facility_id');

      const counts: Record<string, number> = {};
      if (reports) {
        for (const r of reports) {
          counts[r.facility_id] = (counts[r.facility_id] || 0) + 1;
        }
      }

      const facilitiesWithCount = (facilities || []).map((f) => ({
        ...f,
        report_count: counts[f.id] || 0,
      }));

      return NextResponse.json(
        {
          success: true,
          data: facilitiesWithCount,
          message: 'Daftar fasilitas berhasil diambil (Supabase).',
        },
        { status: 200 }
      );
    }

    // 3. FALLBACK LOCAL STORE
    const facilities = localStore.getFacilities();
    const reports = localStore.getReports();

    const counts: Record<string, number> = {};
    for (const r of reports) {
      counts[r.facility_id] = (counts[r.facility_id] || 0) + 1;
    }

    const facilitiesWithCount = facilities.map((f) => ({
      ...f,
      report_count: counts[f.id] || 0,
    }));

    return NextResponse.json(
      {
        success: true,
        data: facilitiesWithCount,
        message: 'Daftar fasilitas berhasil diambil (mode lokal).',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: 'Terjadi kesalahan server: ' + (error?.message || 'Internal Server Error'),
      },
      { status: 500 }
    );
  }
}
