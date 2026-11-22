import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { isNeonConfigured, neonGetReports, neonCreateReport } from '@/lib/neon';
import { getAuthUserFromRequest } from '@/lib/auth';
import { localStore } from '@/lib/localStore';

const reportSchema = z.object({
  facility_id: z.string().min(1, 'ID fasilitas wajib dipilih'),
  category: z.enum(
    ['AC', 'Lampu', 'Kursi/Meja', 'Toilet', 'Proyektor', 'Jaringan/WiFi', 'Lainnya'],
    { errorMap: () => ({ message: 'Kategori tidak valid' }) }
  ),
  title: z.string().min(3, 'Judul laporan minimal 3 karakter'),
  description: z.string().min(5, 'Deskripsi laporan minimal 5 karakter'),
  photo_url: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    // 1. NEON POSTGRES
    if (isNeonConfigured) {
      const reports = await neonGetReports(q, category);
      return NextResponse.json(
        {
          success: true,
          data: reports,
          message: 'Daftar laporan berhasil diambil (Neon Postgres).',
        },
        { status: 200 }
      );
    }

    // 2. SUPABASE POSTGRES
    if (isSupabaseConfigured) {
      let query = supabaseServer
        .from('reports')
        .select('*, facilities(id, name, building), users(id, name, email)')
        .order('created_at', { ascending: false });

      if (category && category !== 'Semua') {
        query = query.eq('category', category);
      }

      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }

      const { data: reports, error } = await query;

      if (error) {
        return NextResponse.json(
          { success: false, data: null, message: 'Gagal mengambil daftar laporan: ' + error.message },
          { status: 500 }
        );
      }

      const formattedReports = (reports || []).map((r: any) => ({
        ...r,
        facility_name: r.facilities?.name || 'Fasilitas Kampus',
        facility_building: r.facilities?.building || '',
        user_name: r.users?.name || 'Mahasiswa',
      }));

      return NextResponse.json(
        { success: true, data: formattedReports, message: 'Daftar laporan berhasil diambil (Supabase).' },
        { status: 200 }
      );
    }

    // 3. FALLBACK LOCAL STORE
    const reports = localStore.getReports(q, category);
    return NextResponse.json(
      {
        success: true,
        data: reports,
        message: 'Daftar laporan berhasil diambil (mode lokal).',
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

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Anda harus login untuk membuat laporan.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = reportSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: validatedData.error.errors[0]?.message || 'Data laporan tidak valid',
          error: validatedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { facility_id, category, title, description, photo_url, latitude, longitude } =
      validatedData.data;

    // 1. NEON POSTGRES
    if (isNeonConfigured) {
      const newReport = await neonCreateReport({
        user_id: authUser.userId,
        facility_id,
        category,
        title,
        description,
        photo_url,
        latitude,
        longitude,
      });

      if (!newReport) {
        return NextResponse.json(
          { success: false, data: null, message: 'Gagal menyimpan laporan ke database Neon.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: newReport,
          message: 'Laporan fasilitas kampus berhasil dikirim (Neon Postgres)!',
        },
        { status: 201 }
      );
    }

    // 2. SUPABASE POSTGRES
    if (isSupabaseConfigured) {
      const { data: facility, error: facErr } = await supabaseServer
        .from('facilities')
        .select('id, name')
        .eq('id', facility_id)
        .single();

      if (facErr || !facility) {
        return NextResponse.json(
          { success: false, data: null, message: 'Fasilitas yang dipilih tidak ditemukan.' },
          { status: 400 }
        );
      }

      const { data: newReport, error: insertError } = await supabaseServer
        .from('reports')
        .insert({
          user_id: authUser.userId,
          facility_id,
          category,
          title,
          description,
          photo_url: photo_url || null,
          latitude: latitude !== undefined ? latitude : null,
          longitude: longitude !== undefined ? longitude : null,
        })
        .select('*, facilities(id, name, building), users(id, name, email)')
        .single();

      if (insertError || !newReport) {
        return NextResponse.json(
          { success: false, data: null, message: 'Gagal menyimpan laporan: ' + insertError?.message },
          { status: 500 }
        );
      }

      const formattedReport = {
        ...newReport,
        facility_name: newReport.facilities?.name,
        facility_building: newReport.facilities?.building,
        user_name: newReport.users?.name,
      };

      return NextResponse.json(
        { success: true, data: formattedReport, message: 'Laporan berhasil dikirim (Supabase)!' },
        { status: 201 }
      );
    }

    // 3. FALLBACK LOCAL STORE
    const facility = localStore.getFacilityById(facility_id);
    if (!facility) {
      return NextResponse.json(
        { success: false, data: null, message: 'Fasilitas yang dipilih tidak ditemukan.' },
        { status: 400 }
      );
    }

    const newReport = localStore.addReport({
      id: `r-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: authUser.userId,
      facility_id,
      category,
      title,
      description,
      photo_url: photo_url || null,
      latitude: latitude !== undefined ? latitude : null,
      longitude: longitude !== undefined ? longitude : null,
      created_at: new Date().toISOString(),
      facility_name: facility.name,
      facility_building: facility.building,
      user_name: authUser.name,
    });

    return NextResponse.json(
      {
        success: true,
        data: newReport,
        message: 'Laporan fasilitas kampus berhasil dikirim (mode lokal)!',
      },
      { status: 201 }
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
