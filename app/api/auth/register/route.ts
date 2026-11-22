import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isNeonConfigured, neonFindUserByEmail, neonCreateUser } from '@/lib/neon';
import { hashPassword } from '@/lib/auth';
import { sendOtpVerificationEmail } from '@/lib/brevo';
import { localStore } from '@/lib/localStore';

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
    const cleanEmail = email.trim().toLowerCase();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. NEON POSTGRES
    if (isNeonConfigured) {
      const existingUser = await neonFindUserByEmail(cleanEmail);
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

      const password_hash = await hashPassword(password);
      const newUser = await neonCreateUser(name, cleanEmail, password_hash, 'mahasiswa', false, otp);

      if (!newUser) {
        return NextResponse.json(
          { success: false, data: null, message: 'Gagal membuat akun di database Neon.' },
          { status: 500 }
        );
      }

      // Kirim email verifikasi OTP via Brevo API
      await sendOtpVerificationEmail({
        toEmail: cleanEmail,
        toName: name,
        otp,
      });

      return NextResponse.json(
        {
          success: true,
          requiresVerification: true,
          email: cleanEmail,
          // devOtp dikirimkan agar jika Brevo belum diisi api key, pengembang tidak terhambat
          devOtp: (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your_brevo_api_key_here') ? otp : undefined,
          message: 'Pendaftaran berhasil! Kode verifikasi OTP telah dikirimkan ke email kampus Anda.',
        },
        { status: 201 }
      );
    }

    // 2. FALLBACK LOKAL
    const existing = localStore.findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar.' },
        { status: 409 }
      );
    }

    const user = localStore.addUser({
      id: 'u-' + Date.now(),
      name,
      email: cleanEmail,
      password_hash: password,
      role: 'mahasiswa',
      created_at: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        devOtp: otp,
        message: 'Registrasi berhasil (mode lokal).',
      },
      { status: 201 }
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
