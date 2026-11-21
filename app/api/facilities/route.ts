import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET() {
  try {
    // Ambil semua data fasilitas diurutkan berdasarkan nama
    const { data: facilities, error: facError } = await supabaseServer
      .from('facilities')
      .select('*')
      .order('name', { ascending: true });

    if (facError) {
      console.error('Error fetching facilities:', facError);
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Gagal mengambil data fasilitas: ' + facError.message,
        },
        { status: 500 }
      );
    }

    // Ambil jumlah laporan untuk masing-masing fasilitas
    const { data: reports, error: repError } = await supabaseServer
      .from('reports')
      .select('facility_id');

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
