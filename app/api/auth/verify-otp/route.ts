import { randomInt } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isNeonConfigured, neonVerifyUserOtp, neonFindUserByEmail, neonSetUserOtp } from '@/lib/neon';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { sendOtpVerificationEmail } from '@/lib/brevo';
import { isSupabaseConfigured, supabaseServer } from '@/lib/supabase';
import { localStore } from '@/lib/localStore';
import type { UserRole } from '@/types';

const verifySchema = z.object({
  email: z.string().email('Format email tidak valid'),
  otp: z.string().min(4, 'Kode OTP minimal 4 digit'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = verifySchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: validatedData.error.errors[0]?.message || 'Data verifikasi tidak valid',
        },
        { status: 400 }
      );
    }

    const { email, otp } = validatedData.data;
    const cleanEmail = email.trim().toLowerCase();
    let user: { id: string; name: string; email: string; role?: UserRole | null } | null = null;

    // 1. NEON POSTGRES
    if (isNeonConfigured) {
      user = await neonVerifyUserOtp(cleanEmail, otp.trim());
    } else if (isSupabaseConfigured) {
      const { data: verifiedUser, error } = await supabaseServer
        .from('users')
        .update({
          email_verified: true,
          verification_otp: null,
          otp_expires_at: null,
        })
        .eq('email', cleanEmail)
        .eq('verification_otp', otp.trim())
        .gt('otp_expires_at', new Date().toISOString())
        .select('id, name, email, role')
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { success: false, data: null, message: 'Gagal memverifikasi akun di Supabase: ' + error.message },
          { status: 500 }
        );
      }
      user = verifiedUser;
    } else {
      user = localStore.verifyUserOtp(cleanEmail, otp.trim());
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Kode OTP salah atau telah kadaluarsa. Silakan periksa kembali.',
        },
        { status: 400 }
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
            email_verified: true,
          },
        },
        message: 'Akun Anda berhasil diverifikasi! Selamat datang di LaporKampus.',
      },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server saat memproses verifikasi: ' + error.message,
      },
      { status: 500 }
    );
  }
}

// Handler untuk mengirim ulang OTP
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email wajib diisi' }, { status: 400 });
    }
    if (!z.string().email().safeParse(email).success) {
      return NextResponse.json({ success: false, message: 'Format email tidak valid' }, { status: 400 });
    }

    const newOtp = randomInt(100000, 1000000).toString();

    if (isNeonConfigured) {
      const user = await neonFindUserByEmail(email);
      if (!user) {
        return NextResponse.json({ success: false, message: 'Akun tidak ditemukan' }, { status: 404 });
      }
      if (user.email_verified) {
        return NextResponse.json({ success: false, message: 'Email akun ini sudah diverifikasi.' }, { status: 409 });
      }

      await neonSetUserOtp(email, newOtp);
      const emailResult = await sendOtpVerificationEmail({ toEmail: email, toName: user.name, otp: newOtp });
      return NextResponse.json(
        {
          success: emailResult.success,
          message: emailResult.success
            ? 'Kode OTP baru berhasil dikirimkan ke email Anda.'
            : 'Email gagal dikirim: ' + (emailResult.error || 'Periksa kuota/konfigurasi Brevo'),
          devOtp: !emailResult.success && process.env.NODE_ENV !== 'production' ? newOtp : undefined,
        },
        { status: emailResult.success ? 200 : 502 }
      );
    }

    if (isSupabaseConfigured) {
      const { data: user, error } = await supabaseServer
        .from('users')
        .select('name, email_verified')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, message: 'Gagal mencari akun di Supabase: ' + error.message }, { status: 500 });
      }
      if (!user) {
        return NextResponse.json({ success: false, message: 'Akun tidak ditemukan' }, { status: 404 });
      }
      if (user.email_verified) {
        return NextResponse.json({ success: false, message: 'Email akun ini sudah diverifikasi.' }, { status: 409 });
      }

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const { error: updateError } = await supabaseServer
        .from('users')
        .update({ verification_otp: newOtp, otp_expires_at: expiresAt })
        .eq('email', email);
      if (updateError) {
        return NextResponse.json({ success: false, message: 'Gagal memperbarui OTP: ' + updateError.message }, { status: 500 });
      }

      const emailResult = await sendOtpVerificationEmail({ toEmail: email, toName: user.name, otp: newOtp });
      return NextResponse.json(
        {
          success: emailResult.success,
          message: emailResult.success
            ? 'Kode OTP baru berhasil dikirimkan ke email Anda.'
            : 'Email gagal dikirim: ' + (emailResult.error || 'Periksa kuota/konfigurasi Brevo'),
          devOtp: !emailResult.success && process.env.NODE_ENV !== 'production' ? newOtp : undefined,
        },
        { status: emailResult.success ? 200 : 502 }
      );
    }

    const user = localStore.findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Akun tidak ditemukan' }, { status: 404 });
    }
    if (user.email_verified) {
      return NextResponse.json({ success: false, message: 'Email akun ini sudah diverifikasi.' }, { status: 409 });
    }
    localStore.setUserOtp(email, newOtp);
    const emailResult = await sendOtpVerificationEmail({ toEmail: email, toName: user.name, otp: newOtp });
    return NextResponse.json(
      {
        success: emailResult.success,
        message: emailResult.success
          ? 'Kode OTP baru berhasil dikirimkan ke email Anda.'
          : 'Email gagal dikirim. Silakan periksa konfigurasi Brevo lalu coba lagi.',
        devOtp: !emailResult.success && process.env.NODE_ENV !== 'production' ? newOtp : undefined,
      },
      { status: emailResult.success ? 200 : 502 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
