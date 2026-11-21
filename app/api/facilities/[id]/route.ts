import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Ambil detail fasilitas
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

    // Ambil laporan yang terkait dengan fasilitas ini
    const { data: reports, error: repError } = await supabaseServer
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
