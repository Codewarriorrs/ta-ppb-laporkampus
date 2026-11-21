import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

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

    const { data: reports, error } = await supabaseServer
      .from('reports')
      .select('*, facilities(id, name, building), users(id, name, email)')
      .eq('user_id', authUser.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my reports:', error);
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Gagal mengambil riwayat laporan Anda: ' + error.message,
        },
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
        message: 'Daftar laporan milik Anda berhasil diambil.',
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
