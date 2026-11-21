import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { localStore } from '@/lib/localStore';

export async function GET() {
  try {
    // A. Fallback Local Data Store
    if (!isSupabaseConfigured) {
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
    }

    // B. Supabase PostgreSQL
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
        message: 'Daftar fasilitas berhasil diambil.',
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
