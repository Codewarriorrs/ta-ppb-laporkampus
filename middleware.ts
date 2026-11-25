import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE_NAME = 'laporkampus_token';
const JWT_SECRET_STRING =
  process.env.JWT_SECRET || 'lapor-kampus-secret-key-fallback-min-32-chars-long-praktikum-ppb';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

// Daftar path publik yang tidak memerlukan autentikasi
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/offline',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-otp',
  '/manifest.webmanifest',
  '/sw.js',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan akses ke file internal Next.js, static files, dan ikon PWA
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Ambil token dari cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let isAuthenticated = false;
  let userRole: string | undefined;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
      userRole = typeof payload.role === 'string' ? payload.role : undefined;
    } catch {
      isAuthenticated = false;
    }
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));

  // Jika sudah login dan mengakses login/register, arahkan ke beranda sesuai role
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(
      new URL(userRole === 'birokrasi' ? '/birokrasi' : '/', request.url)
    );
  }

  // Untuk akun birokrasi, halaman utama (/) diarahkan ke dashboard birokrasi
  if (isAuthenticated && userRole === 'birokrasi' && pathname === '/') {
    return NextResponse.redirect(new URL('/birokrasi', request.url));
  }

  // Jika belum login dan mengakses halaman yang dilindungi
  if (!isAuthenticated && !isPublicPath) {
    // Jika request ke API, kembalikan 401 Unauthorized JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'Sesi login tidak valid atau telah berakhir. Silakan login kembali.',
        },
        { status: 401 }
      );
    }

    // Redirect ke halaman login dengan query parameter callback
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/birokrasi' || pathname.startsWith('/birokrasi/')) {
    if (userRole !== 'birokrasi') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
