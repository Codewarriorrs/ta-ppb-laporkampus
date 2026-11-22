import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isNeonConfigured, neonVerifyUserOtp, neonFindUserByEmail, neonSetUserOtp } from '@/lib/neon';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { sendOtpVerificationEmail } from '@/lib/brevo';

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

    // 1. NEON POSTGRES
    if (isNeonConfigured) {
      const user = await neonVerifyUserOtp(email, otp.trim());

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

      // Terbitkan sesi login
      const token = await signToken({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      const response = NextResponse.json(
        {
          success: true,
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
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
    }

    // Fallback mode lokal
    return NextResponse.json({
      success: true,
      message: 'Verifikasi berhasil (mode lokal).',
    });
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
    const email = body.email;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email wajib diisi' }, { status: 400 });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    if (isNeonConfigured) {
      const user = await neonFindUserByEmail(email);
      if (!user) {
        return NextResponse.json({ success: false, message: 'Akun tidak ditemukan' }, { status: 404 });
      }

      await neonSetUserOtp(email, newOtp);
      await sendOtpVerificationEmail({ toEmail: email, toName: user.name, otp: newOtp });

      return NextResponse.json({
        success: true,
        message: 'Kode OTP baru berhasil dikirimkan ke email Anda.',
        devOtp: process.env.NODE_ENV !== 'production' ? newOtp : undefined,
      });
    }

    return NextResponse.json({ success: true, message: 'OTP terkirim.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
