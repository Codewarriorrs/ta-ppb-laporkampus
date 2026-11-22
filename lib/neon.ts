import { neon } from '@neondatabase/serverless';
import { User, Facility, Report } from '@/types';

const databaseUrl = process.env.DATABASE_URL || '';

/**
 * Cek apakah kredensial database Neon sudah diset di environment variables
 */
export const isNeonConfigured = Boolean(
  databaseUrl &&
    (databaseUrl.includes('neon.tech') || databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) &&
    !databaseUrl.includes('placeholder')
);

// Inisialisasi SQL executor dari @neondatabase/serverless
export const sql = isNeonConfigured ? neon(databaseUrl) : null;

// ==========================================
// 1. HELPER USER (AUTH)
// ==========================================
export interface NeonUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export async function neonFindUserByEmail(email: string): Promise<NeonUser | null> {
  if (!sql) return null;
  const rows = await sql`
    SELECT id, name, email, password_hash, created_at 
    FROM users 
    WHERE LOWER(email) = LOWER(${email}) 
    LIMIT 1
  `;
  return (rows[0] as unknown as NeonUser) || null;
}

export async function neonFindUserById(id: string): Promise<Omit<NeonUser, 'password_hash'> | null> {
  if (!sql) return null;
  const rows = await sql`
    SELECT id, name, email, created_at 
    FROM users 
    WHERE id = ${id} 
    LIMIT 1
  `;
  return (rows[0] as unknown as Omit<NeonUser, 'password_hash'>) || null;
}

export async function neonCreateUser(name: string, email: string, password_hash: string): Promise<Omit<NeonUser, 'password_hash'> | null> {
  if (!sql) return null;
  const rows = await sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${name}, LOWER(${email}), ${password_hash})
    RETURNING id, name, email, created_at
  `;
  return (rows[0] as unknown as Omit<NeonUser, 'password_hash'>) || null;
}

// ==========================================
// 2. HELPER FASILITAS
// ==========================================
export async function neonGetFacilities() {
  if (!sql) return [];
  const rows = await sql`
    SELECT 
      f.id, 
      f.name, 
      f.building, 
      f.description, 
      f.image_url, 
      f.created_at,
      COUNT(r.id)::int AS report_count
    FROM facilities f
    LEFT JOIN reports r ON f.id = r.facility_id
    GROUP BY f.id
    ORDER BY f.name ASC
  `;
  return rows as Facility[];
}

export async function neonGetFacilityById(id: string) {
  if (!sql) return null;
  const facilities = await sql`
    SELECT id, name, building, description, image_url, created_at
    FROM facilities
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!facilities || facilities.length === 0) return null;

  const reports = await sql`
    SELECT 
      r.id,
      r.user_id,
      r.facility_id,
      r.category,
      r.title,
      r.description,
      r.photo_url,
      r.latitude,
      r.longitude,
      r.created_at,
      u.name AS user_name
    FROM reports r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.facility_id = ${id}
    ORDER BY r.created_at DESC
  `;

  return {
    ...facilities[0],
    report_count: reports.length,
    reports,
  };
}

// ==========================================
// 3. HELPER LAPORAN
// ==========================================
export async function neonGetReports(q = '', category = '') {
  if (!sql) return [];

  // Query dengan join fasilitas dan user
  let queryText = `
    SELECT 
      r.id,
      r.user_id,
      r.facility_id,
      r.category,
      r.title,
      r.description,
      r.photo_url,
      r.latitude,
      r.longitude,
      r.created_at,
      f.name AS facility_name,
      f.building AS facility_building,
      u.name AS user_name
    FROM reports r
    LEFT JOIN facilities f ON r.facility_id = f.id
    LEFT JOIN users u ON r.user_id = u.id
    WHERE 1=1
  `;

  if (category && category !== 'Semua') {
    if (q) {
      const searchPattern = `%${q}%`;
      return await sql`
        SELECT 
          r.id,
          r.user_id,
          r.facility_id,
          r.category,
          r.title,
          r.description,
          r.photo_url,
          r.latitude,
          r.longitude,
          r.created_at,
          f.name AS facility_name,
          f.building AS facility_building,
          u.name AS user_name
        FROM reports r
        LEFT JOIN facilities f ON r.facility_id = f.id
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.category = ${category}
          AND (r.title ILIKE ${searchPattern} OR r.description ILIKE ${searchPattern})
        ORDER BY r.created_at DESC
      ` as Report[];
    } else {
      return await sql`
        SELECT 
          r.id,
          r.user_id,
          r.facility_id,
          r.category,
          r.title,
          r.description,
          r.photo_url,
          r.latitude,
          r.longitude,
          r.created_at,
          f.name AS facility_name,
          f.building AS facility_building,
          u.name AS user_name
        FROM reports r
        LEFT JOIN facilities f ON r.facility_id = f.id
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.category = ${category}
        ORDER BY r.created_at DESC
      ` as Report[];
    }
  }

  if (q) {
    const searchPattern = `%${q}%`;
    return await sql`
      SELECT 
        r.id,
        r.user_id,
        r.facility_id,
        r.category,
        r.title,
        r.description,
        r.photo_url,
        r.latitude,
        r.longitude,
        r.created_at,
        f.name AS facility_name,
        f.building AS facility_building,
        u.name AS user_name
      FROM reports r
      LEFT JOIN facilities f ON r.facility_id = f.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE (r.title ILIKE ${searchPattern} OR r.description ILIKE ${searchPattern})
      ORDER BY r.created_at DESC
    ` as Report[];
  }

  return await sql`
    SELECT 
      r.id,
      r.user_id,
      r.facility_id,
      r.category,
      r.title,
      r.description,
      r.photo_url,
      r.latitude,
      r.longitude,
      r.created_at,
      f.name AS facility_name,
      f.building AS facility_building,
      u.name AS user_name
    FROM reports r
    LEFT JOIN facilities f ON r.facility_id = f.id
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  ` as Report[];
}

export async function neonGetReportsByUserId(userId: string) {
  if (!sql) return [];
  return await sql`
    SELECT 
      r.id,
      r.user_id,
      r.facility_id,
      r.category,
      r.title,
      r.description,
      r.photo_url,
      r.latitude,
      r.longitude,
      r.created_at,
      f.name AS facility_name,
      f.building AS facility_building,
      u.name AS user_name
    FROM reports r
    LEFT JOIN facilities f ON r.facility_id = f.id
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.user_id = ${userId}
    ORDER BY r.created_at DESC
  ` as Report[];
}

export async function neonGetReportById(id: string): Promise<Report | null> {
  if (!sql) return null;
  const rows = await sql`
    SELECT 
      r.id,
      r.user_id,
      r.facility_id,
      r.category,
      r.title,
      r.description,
      r.photo_url,
      r.latitude,
      r.longitude,
      r.created_at,
      f.name AS facility_name,
      f.building AS facility_building,
      u.name AS user_name
    FROM reports r
    LEFT JOIN facilities f ON r.facility_id = f.id
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.id = ${id}
    LIMIT 1
  `;
  return (rows[0] as unknown as Report) || null;
}

export async function neonCreateReport(data: {
  user_id: string;
  facility_id: string;
  category: string;
  title: string;
  description: string;
  photo_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  if (!sql) return null;
  const inserted = await sql`
    INSERT INTO reports (
      user_id, facility_id, category, title, description, photo_url, latitude, longitude
    ) VALUES (
      ${data.user_id}, 
      ${data.facility_id}, 
      ${data.category}, 
      ${data.title}, 
      ${data.description}, 
      ${data.photo_url || null}, 
      ${data.latitude !== undefined ? data.latitude : null}, 
      ${data.longitude !== undefined ? data.longitude : null}
    )
    RETURNING id
  `;

  if (!inserted || inserted.length === 0) return null;
  return neonGetReportById(inserted[0].id);
}

export async function neonUpdateReport(id: string, updates: any) {
  if (!sql) return null;

  // Update dinamis
  await sql`
    UPDATE reports SET
      facility_id = COALESCE(${updates.facility_id || null}, facility_id),
      category = COALESCE(${updates.category || null}, category),
      title = COALESCE(${updates.title || null}, title),
      description = COALESCE(${updates.description || null}, description),
      photo_url = COALESCE(${updates.photo_url !== undefined ? updates.photo_url : null}, photo_url),
      latitude = COALESCE(${updates.latitude !== undefined ? updates.latitude : null}, latitude),
      longitude = COALESCE(${updates.longitude !== undefined ? updates.longitude : null}, longitude)
    WHERE id = ${id}
  `;

  return neonGetReportById(id);
}

export async function neonDeleteReport(id: string) {
  if (!sql) return false;
  await sql`DELETE FROM reports WHERE id = ${id}`;
  return true;
}
