import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Anda harus login untuk mengunggah foto.',
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Berkas foto tidak ditemukan dalam permintaan (field "file" kosong).',
        },
        { status: 400 }
      );
    }

    // Validasi ukuran berkas
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Ukuran berkas terlalu besar. Maksimal ukuran foto adalah 5MB.',
        },
        { status: 400 }
      );
    }

    // Validasi tipe MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Format berkas tidak didukung. Harap unggah foto berekstensi JPEG, PNG, WEBP, atau GIF.',
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // A. Fallback jika Supabase Storage belum dikonfigurasi: kembalikan Data URL base64
    if (!isSupabaseConfigured) {
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64Data}`;

      return NextResponse.json(
        {
          success: true,
          data: {
            url: dataUrl,
            path: 'local-memory',
          },
          message: 'Foto bukti laporan berhasil diunggah (mode lokal).',
        },
        { status: 200 }
      );
    }

    // B. Supabase Storage bucket 'reports'
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${authUser.userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from('reports')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message:
            'Gagal menyimpan foto ke Supabase Storage. Pastikan bucket "reports" sudah dibuat dengan status public di Supabase: ' +
            uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseServer.storage
      .from('reports')
      .getPublicUrl(uploadData.path);

    return NextResponse.json(
      {
        success: true,
        data: {
          url: publicUrlData.publicUrl,
          path: uploadData.path,
        },
        message: 'Foto bukti laporan berhasil diunggah ke Supabase Storage.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: 'Terjadi kesalahan saat memproses unggahan: ' + (error?.message || 'Internal Server Error'),
      },
      { status: 500 }
    );
  }
}
