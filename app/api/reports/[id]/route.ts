import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { localStore } from '@/lib/localStore';

const updateReportSchema = z.object({
  facility_id: z.string().optional(),
  category: z
    .enum(['AC', 'Lampu', 'Kursi/Meja', 'Toilet', 'Proyektor', 'Jaringan/WiFi', 'Lainnya'])
    .optional(),
  title: z.string().min(3, 'Judul minimal 3 karakter').optional(),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter').optional(),
  photo_url: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // A. Fallback Local Data Store
    if (!isSupabaseConfigured) {
      const report = localStore.getReportById(id);
      if (!report) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: 'Laporan tidak ditemukan.',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: report,
          message: 'Detail laporan berhasil diambil (mode lokal).',
        },
        { status: 200 }
      );
    }

    // B. Supabase PostgreSQL
    const { data: report, error } = await supabaseServer
      .from('reports')
      .select('*, facilities(id, name, building, description), users(id, name, email)')
      .eq('id', id)
      .single();

    if (error || !report) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Laporan tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    const formattedReport = {
      ...report,
      facility_name: report.facilities?.name || 'Fasilitas Kampus',
      facility_building: report.facilities?.building || '',
      user_name: report.users?.name || 'Mahasiswa',
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedReport,
        message: 'Detail laporan berhasil diambil.',
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Anda harus login untuk mengedit laporan.',
        },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = updateReportSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: validatedData.error.errors[0]?.message || 'Data update tidak valid',
          error: validatedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    // A. Fallback Local Data Store
    if (!isSupabaseConfigured) {
      const existing = localStore.getReportById(id);
      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: 'Laporan tidak ditemukan.',
          },
          { status: 404 }
        );
      }

      if (existing.user_id !== authUser.userId) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: 'Akses ditolak: Anda hanya dapat mengedit laporan buatan Anda sendiri.',
          },
          { status: 403 }
        );
      }

      const updateData: any = { ...validatedData.data };
      if (validatedData.data.facility_id) {
        const fac = localStore.getFacilityById(validatedData.data.facility_id);
        if (fac) {
          updateData.facility_name = fac.name;
          updateData.facility_building = fac.building;
        }
      }

      const updated = localStore.updateReport(id, updateData);

      return NextResponse.json(
        {
          success: true,
          data: updated,
          message: 'Laporan berhasil diperbarui.',
        },
        { status: 200 }
      );
    }

    // B. Supabase PostgreSQL
    const { data: existingReport, error: fetchError } = await supabaseServer
      .from('reports')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingReport) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Laporan tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    if (existingReport.user_id !== authUser.userId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Akses ditolak: Anda hanya dapat mengedit laporan buatan Anda sendiri.',
        },
        { status: 403 }
      );
    }

    if (validatedData.data.facility_id) {
      const { data: facCheck } = await supabaseServer
        .from('facilities')
        .select('id')
        .eq('id', validatedData.data.facility_id)
        .single();

      if (!facCheck) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: 'Fasilitas baru yang dipilih tidak valid.',
          },
          { status: 400 }
        );
      }
    }

    const updatePayload: any = {};
    if (validatedData.data.facility_id !== undefined) updatePayload.facility_id = validatedData.data.facility_id;
    if (validatedData.data.category !== undefined) updatePayload.category = validatedData.data.category;
    if (validatedData.data.title !== undefined) updatePayload.title = validatedData.data.title;
    if (validatedData.data.description !== undefined) updatePayload.description = validatedData.data.description;
    if (validatedData.data.photo_url !== undefined) updatePayload.photo_url = validatedData.data.photo_url;
    if (validatedData.data.latitude !== undefined) updatePayload.latitude = validatedData.data.latitude;
    if (validatedData.data.longitude !== undefined) updatePayload.longitude = validatedData.data.longitude;

    const { data: updatedReport, error: updateError } = await supabaseServer
      .from('reports')
      .update(updatePayload)
      .eq('id', id)
      .select('*, facilities(id, name, building), users(id, name, email)')
      .single();

    if (updateError || !updatedReport) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Gagal memperbarui laporan: ' + (updateError?.message || 'Unknown error'),
        },
        { status: 500 }
      );
    }

    const formattedReport = {
      ...updatedReport,
      facility_name: updatedReport.facilities?.name,
      facility_building: updatedReport.facilities?.building,
      user_name: updatedReport.users?.name,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedReport,
        message: 'Laporan berhasil diperbarui.',
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Anda harus login untuk menghapus laporan.',
        },
        { status: 401 }
      );
    }

    const { id } = params;

    // A. Fallback Local Data Store
    if (!isSupabaseConfigured) {
      const existing = localStore.getReportById(id);
      if (!existing) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: 'Laporan tidak ditemukan.',
          },
          { status: 404 }
        );
      }

      if (existing.user_id !== authUser.userId) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            message: 'Akses ditolak: Anda hanya dapat menghapus laporan milik Anda sendiri.',
          },
          { status: 403 }
        );
      }

      localStore.deleteReport(id);

      return NextResponse.json(
        {
          success: true,
          data: null,
          message: 'Laporan berhasil dihapus.',
        },
        { status: 200 }
      );
    }

    // B. Supabase PostgreSQL
    const { data: existingReport, error: fetchError } = await supabaseServer
      .from('reports')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingReport) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Laporan tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    if (existingReport.user_id !== authUser.userId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Akses ditolak: Anda hanya dapat menghapus laporan milik Anda sendiri.',
        },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabaseServer.from('reports').delete().eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Gagal menghapus laporan: ' + deleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Laporan berhasil dihapus.',
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
