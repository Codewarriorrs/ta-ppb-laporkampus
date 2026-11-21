import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { localStore } from '@/lib/localStore';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // A. Fallback Local Data Store
    if (!isSupabaseConfigured) {
      const facility = localStore.getFacilityById(id);
      if (!facility) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: 'Fasilitas tidak ditemukan.',
          },
          { status: 404 }
        );
      }

      const reports = localStore.getReportsByFacilityId(id);

      return NextResponse.json(
        {
          success: true,
          data: {
            ...facility,
            report_count: reports.length,
            reports,
          },
          message: 'Detail fasilitas dan laporan terkait berhasil diambil (mode lokal).',
        },
        { status: 200 }
      );
    }

    // B. Supabase PostgreSQL
    const { data: facility, error: facError } = await supabaseServer
      .from('facilities')
      .select('*')
      .eq('id', id)
      .single();

    if (facError || !facility) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Fasilitas tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    const { data: reports } = await supabaseServer
      .from('reports')
      .select('*, users(id, name, email)')
      .eq('facility_id', id)
      .order('created_at', { ascending: false });

    const formattedReports = (reports || []).map((r: any) => ({
      ...r,
      user_name: r.users?.name || 'Mahasiswa',
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          ...facility,
          report_count: formattedReports.length,
          reports: formattedReports,
        },
        message: 'Detail fasilitas dan laporan terkait berhasil diambil.',
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
