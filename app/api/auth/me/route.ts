import { NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Sesi tidak ditemukan atau telah kedaluwarsa.',
        },
        { status: 401 }
      );
    }

    // Ambil data profil terbaru dari database
    const { data: user, error } = await supabaseServer
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', authUser.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Pengguna tidak ditemukan dalam sistem.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: 'Data sesi pengguna berhasil dimuat.',
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
