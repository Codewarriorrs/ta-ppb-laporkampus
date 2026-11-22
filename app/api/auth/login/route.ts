import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { isNeonConfigured, neonFindUserByEmail } from '@/lib/neon';
import { comparePassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { localStore } from '@/lib/localStore';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: validatedData.error.errors[0]?.message || 'Input login tidak valid',
          error: validatedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, password } = validatedData.data;

    let user: { id: string; name: string; email: string; password_hash: string; role?: any } | null = null;

    // 1. NEON POSTGRES
    if (isNeonConfigured) {
      const dbUser = await neonFindUserByEmail(email);
      if (dbUser) user = dbUser;
    } else if (isSupabaseConfigured) {
      // 2. SUPABASE POSTGRES
      const { data: dbUser } = await supabaseServer
        .from('users')
        .select('id, name, email, password_hash, role')
        .eq('email', email.toLowerCase())
        .single();
      if (dbUser) user = dbUser;
    } else {
      // 3. FALLBACK LOCAL STORE
      const found = localStore.findUserByEmail(email);
      if (found) user = found;
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Email atau password yang Anda masukkan salah.',
        },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Email atau password yang Anda masukkan salah.',
        },
        { status: 401 }
      );
    }

    // Cek apakah email sudah diverifikasi (jika ada flag email_verified)
    if ((user as any).email_verified === false) {
      return NextResponse.json(
        {
          success: false,
          requiresVerification: true,
          email: user.email,
          message: 'Email Anda belum diverifikasi. Silakan masukkan kode OTP yang telah dikirimkan ke email Anda.',
        },
        { status: 403 }
      );
    }

    const token = await signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'mahasiswa',
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'mahasiswa',
          },
        },
        message: 'Login berhasil! Selamat datang kembali.',
      },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: 'Terjadi kesalahan pada server: ' + (error?.message || 'Internal Server Error'),
      },
      { status: 500 }
    );
  }
}
