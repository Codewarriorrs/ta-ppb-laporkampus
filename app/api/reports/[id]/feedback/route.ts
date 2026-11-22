import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUserFromRequest } from '@/lib/auth';
import { isNeonConfigured, neonUpdateReportFeedback, neonGetReportById } from '@/lib/neon';
import { isSupabaseConfigured, supabaseServer } from '@/lib/supabase';
import { localStore } from '@/lib/localStore';
import { ReportStatus } from '@/types';

const feedbackSchema = z.object({
  feedback: z.string().min(3, 'Tanggapan minimal 3 karakter'),
  status: z.enum(['menunggu', 'diproses', 'selesai', 'ditolak']),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, data: null, message: 'Anda harus login untuk menanggapi laporan.' },
        { status: 401 }
      );
    }

    // Hanya birokrasi yang boleh memberikan tanggapan
    if (authUser.role !== 'birokrasi') {
      return NextResponse.json(
        { success: false, data: null, message: 'Hanya pihak kampus / birokrasi yang memiliki izin menanggapi laporan.' },
        { status: 403 }
      );
    }

    const json = await request.json();
    const validated = feedbackSchema.safeParse(json);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: validated.error.errors[0]?.message || 'Input tanggapan tidak valid.',
        },
        { status: 400 }
      );
    }

    const { feedback, status } = validated.data;
    const reportId = params.id;

    // 1. NEON POSTGRES
    if (isNeonConfigured) {
      const existing = await neonGetReportById(reportId);
      if (!existing) {
        return NextResponse.json(
          { success: false, data: null, message: 'Laporan tidak ditemukan.' },
          { status: 404 }
        );
      }

      const updated = await neonUpdateReportFeedback(reportId, feedback, status as ReportStatus, authUser.userId);
      return NextResponse.json(
        {
          success: true,
          data: updated,
          message: 'Tanggapan birokrasi berhasil disimpan ke database Neon.',
        },
        { status: 200 }
      );
    }

    // 2. SUPABASE POSTGRES
    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabaseServer
        .from('reports')
        .update({
          feedback,
          status,
          feedback_by: authUser.userId,
          feedback_at: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, data: null, message: 'Gagal memperbarui tanggapan di Supabase: ' + error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: updated,
          message: 'Tanggapan birokrasi berhasil disimpan ke Supabase.',
        },
        { status: 200 }
      );
    }

    // 3. FALLBACK LOCAL STORE
    const updated = localStore.updateReportFeedback(reportId, feedback, status as ReportStatus, authUser.userId);
    if (!updated) {
      return NextResponse.json(
        { success: false, data: null, message: 'Laporan tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Tanggapan birokrasi berhasil disimpan (mode lokal).',
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
