import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase';
import { comparePassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

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

    // Cari user di database
    const { data: user, error: queryError } = await supabaseServer
      .from('users')
      .select('id, name, email, password_hash')
      .eq('email', email.toLowerCase())
      .single();

    if (queryError || !user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Email atau password yang Anda masukkan salah.',
        },
        { status: 401 }
      );
    }

    // Bandingkan password hash
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

    // Buat JWT token
    const token = await signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
        message: 'Login berhasil! Selamat datang kembali.',
      },
      { status: 200 }
    );

    // Pasang session cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Error login API:', error);
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
