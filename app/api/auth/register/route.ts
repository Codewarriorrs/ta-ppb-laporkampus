import { randomInt } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isNeonConfigured, neonFindUserByEmail, neonCreateUser } from '@/lib/neon';
import { hashPassword } from '@/lib/auth';
import { sendOtpVerificationEmail } from '@/lib/brevo';
import { localStore } from '@/lib/localStore';
import { isSupabaseConfigured, supabaseServer } from '@/lib/supabase';

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
    const otp = randomInt(100000, 1000000).toString();

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

      const emailResult = await sendOtpVerificationEmail({
        toEmail: cleanEmail,
        toName: name,
        otp,
      });

      return NextResponse.json(
        {
          success: true,
          requiresVerification: true,
          email: cleanEmail,
          emailSent: emailResult.success,
          devOtp: !emailResult.success && process.env.NODE_ENV !== 'production' ? otp : undefined,
          message: emailResult.success
            ? 'Pendaftaran berhasil! Kode verifikasi OTP telah dikirimkan ke email Anda.'
            : 'Akun berhasil dibuat, tetapi email verifikasi gagal dikirim. Silakan kirim ulang kode setelah memeriksa konfigurasi email.',
        },
        { status: 201 }
      );
    }

    // 2. SUPABASE POSTGRES
    if (isSupabaseConfigured) {
      const { data: existingUser, error: lookupError } = await supabaseServer
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (lookupError) {
        return NextResponse.json(
          { success: false, data: null, message: 'Gagal memeriksa akun di Supabase: ' + lookupError.message },
          { status: 500 }
        );
      }
      if (existingUser) {
        return NextResponse.json(
          { success: false, data: null, message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.' },
          { status: 409 }
        );
      }

      const { data: newUser, error: insertError } = await supabaseServer
        .from('users')
        .insert({
          name,
          email: cleanEmail,
          password_hash: await hashPassword(password),
          role: 'mahasiswa',
          email_verified: false,
          verification_otp: otp,
          otp_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        })
        .select('id')
        .single();

      if (insertError || !newUser) {
        return NextResponse.json(
          { success: false, data: null, message: 'Gagal membuat akun di Supabase: ' + (insertError?.message || 'Unknown error') },
          { status: 500 }
        );
      }

      const emailResult = await sendOtpVerificationEmail({ toEmail: cleanEmail, toName: name, otp });
      return NextResponse.json(
        {
          success: true,
          requiresVerification: true,
          email: cleanEmail,
          emailSent: emailResult.success,
          devOtp: !emailResult.success && process.env.NODE_ENV !== 'production' ? otp : undefined,
          message: emailResult.success
            ? 'Pendaftaran berhasil! Kode verifikasi OTP telah dikirimkan ke email Anda.'
            : 'Akun berhasil dibuat, tetapi email verifikasi gagal dikirim. Silakan kirim ulang kode setelah memeriksa konfigurasi email.',
        },
        { status: 201 }
      );
    }

    // 3. FALLBACK LOKAL
    const existing = localStore.findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar.' },
        { status: 409 }
      );
    }

    localStore.addUser({
      id: 'u-' + Date.now(),
      name,
      email: cleanEmail,
      password_hash: await hashPassword(password),
      role: 'mahasiswa',
      email_verified: false,
      verification_otp: otp,
      otp_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });
    const emailResult = await sendOtpVerificationEmail({ toEmail: cleanEmail, toName: name, otp });
    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        emailSent: emailResult.success,
        devOtp: !emailResult.success && process.env.NODE_ENV !== 'production' ? otp : undefined,
        message: emailResult.success
          ? 'Pendaftaran berhasil! Kode verifikasi OTP telah dikirimkan ke email Anda.'
          : 'Akun berhasil dibuat, tetapi email verifikasi gagal dikirim. Silakan kirim ulang kode setelah memeriksa konfigurasi email.',
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
