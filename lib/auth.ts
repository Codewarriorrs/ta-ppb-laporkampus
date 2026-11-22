import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWTPayload } from '@/types';

export const AUTH_COOKIE_NAME = 'laporkampus_token';
const JWT_SECRET_STRING =
  process.env.JWT_SECRET || 'lapor-kampus-secret-key-fallback-min-32-chars-long-praktikum-ppb';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

/**
 * Hash password menggunakan bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifikasi kecocokan password dengan hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Buat JWT session token menggunakan jose
 */
export async function signToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
    role: payload.role || 'mahasiswa',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifikasi JWT token menggunakan jose
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
      role: (payload.role as any) || 'mahasiswa',
      exp: payload.exp,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Mendapatkan pengguna yang sedang login dari HTTP Cookies (Server-side)
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Mendapatkan pengguna dari Authorization Header atau Cookie pada API Request
 */
export async function getAuthUserFromRequest(request: Request): Promise<JWTPayload | null> {
  // Cek cookie terlebih dahulu
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));

  let token = match ? match.split('=')[1] : null;

  // Jika tidak ada di cookie, cek Bearer token di header
  if (!token) {
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}
