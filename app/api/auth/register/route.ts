import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase';
import { hashPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: validatedData.error.errors[0]?.message || 'Data input tidak valid',
          error: validatedData.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedData.data;

    // Cek apakah email sudah terdaftar
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.',
        },
        { status: 409 }
      );
    }

    // Hash password dan simpan user baru
    const password_hash = await hashPassword(password);
    const { data: newUser, error: insertError } = await supabaseServer
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash,
      })
      .select('id, name, email, created_at')
      .single();

    if (insertError || !newUser) {
      console.error('Error insert user to Supabase:', insertError);
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Gagal membuat akun baru di database: ' + (insertError?.message || 'Unknown error'),
        },
        { status: 500 }
      );
    }

    // Buat JWT token dan set cookie
    const token = await signToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
          },
        },
        message: 'Registrasi berhasil! Selamat datang di LaporKampus.',
      },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (error: any) {
    console.error('Error register API:', error);
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
