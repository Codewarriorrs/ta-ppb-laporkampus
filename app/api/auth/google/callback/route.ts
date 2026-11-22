import { NextResponse } from 'next/server';
import { neonUpsertGoogleUser, isNeonConfigured } from '@/lib/neon';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { localStore } from '@/lib/localStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateRaw = searchParams.get('state');

  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  let redirectPath = '/';
  if (stateRaw) {
    try {
      const stateObj = JSON.parse(Buffer.from(stateRaw, 'base64').toString('utf-8'));
      if (stateObj?.redirect) redirectPath = stateObj.redirect;
    } catch {
      // Abaikan jika parsing state gagal
    }
  }

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error || 'Otorisasi Google dibatalkan.')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    // 1. Tukarkan kode otorisasi menjadi Google Access Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('Gagal menukarkan token Google OAuth: ' + (tokenData.error_description || 'Unknown error'))}`
      );
    }

    // 2. Ambil profil pengguna dari Google API
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userinfoResponse.json();
    if (!userinfoResponse.ok || !googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent('Gagal mendapatkan profil akun Google.')}`);
    }

    const email = googleUser.email.toLowerCase();
    const name = googleUser.name || googleUser.given_name || 'Pengguna Google';
    const googleId = googleUser.id;

    // 3. Simpan atau update pengguna di database
    let appUser: { id: string; name: string; email: string; role: string };

    if (isNeonConfigured) {
      const user = await neonUpsertGoogleUser({ name, email, google_id: googleId });
      appUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    } else {
      let existing = localStore.findUserByEmail(email);
      if (!existing) {
        existing = localStore.addUser({
          id: 'u-' + Date.now(),
          name,
          email,
          password_hash: '$google_auth$',
          role: 'mahasiswa',
          created_at: new Date().toISOString(),
        });
      }
      appUser = { id: existing.id, name: existing.name, email: existing.email, role: existing.role || 'mahasiswa' };
    }

    // 4. Terbitkan sesi JWT token ke httpOnly cookie
    const token = await signToken({
      userId: appUser.id,
      name: appUser.name,
      email: appUser.email,
      role: appUser.role as any,
    });

    const response = NextResponse.redirect(`${baseUrl}${redirectPath}`);
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return response;
  } catch (err: any) {
    console.error('Google callback error:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent('Terjadi kesalahan saat memproses login Google.')}`);
  }
}
