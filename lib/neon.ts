import { neon } from '@neondatabase/serverless';
import { User, Facility, Report, UserRole, ReportStatus, ReportPriority } from '@/types';

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
  role: UserRole;
  email_verified?: boolean;
  verification_otp?: string;
  otp_expires_at?: string;
  google_id?: string;
  created_at: string;
}

export async function neonFindUserByEmail(email: string): Promise<NeonUser | null> {
  if (!sql) return null;
  const rows = await sql`
    SELECT id, name, email, password_hash, COALESCE(role, 'mahasiswa') AS role, email_verified, verification_otp, otp_expires_at, google_id, created_at 
    FROM users 
    WHERE LOWER(email) = LOWER(${email}) 
    LIMIT 1
  `;
  return (rows[0] as unknown as NeonUser) || null;
}

export async function neonFindUserById(id: string): Promise<Omit<NeonUser, 'password_hash'> | null> {
  if (!sql) return null;
  const rows = await sql`
    SELECT id, name, email, COALESCE(role, 'mahasiswa') AS role, email_verified, created_at 
    FROM users 
    WHERE id = ${id} 
    LIMIT 1
  `;
  return (rows[0] as unknown as Omit<NeonUser, 'password_hash'>) || null;
}

export async function neonCreateUser(
  name: string,
  email: string,
  password_hash: string,
  role: UserRole = 'mahasiswa',
  email_verified: boolean = false,
  otp?: string
): Promise<Omit<NeonUser, 'password_hash'> | null> {
  if (!sql) return null;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const rows = await sql`
    INSERT INTO users (name, email, password_hash, role, email_verified, verification_otp, otp_expires_at)
    VALUES (${name}, LOWER(${email}), ${password_hash}, ${role}, ${email_verified}, ${otp || null}, ${otp ? expiresAt : null})
    RETURNING id, name, email, role, email_verified, created_at
  `;
  return (rows[0] as unknown as Omit<NeonUser, 'password_hash'>) || null;
}

export async function neonUpdateUnverifiedUser(
  name: string,
  email: string,
  password_hash: string,
  otp: string
): Promise<boolean> {
  if (!sql) return false;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await sql`
    UPDATE users
    SET name = ${name}, password_hash = ${password_hash}, verification_otp = ${otp}, otp_expires_at = ${expiresAt}
    WHERE LOWER(email) = LOWER(${email}) AND email_verified = false
  `;
  return true;
}

export async function neonSetUserOtp(email: string, otp: string): Promise<boolean> {
  if (!sql) return false;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await sql`
    UPDATE users 
    SET verification_otp = ${otp}, otp_expires_at = ${expiresAt}
    WHERE LOWER(email) = LOWER(${email})
  `;
  return true;
}

export async function neonVerifyUserOtp(email: string, otp: string): Promise<NeonUser | null> {
  if (!sql) return null;
  const rows = await sql`
    SELECT id, name, email, password_hash, COALESCE(role, 'mahasiswa') AS role, email_verified, created_at
    FROM users 
    WHERE LOWER(email) = LOWER(${email})
      AND verification_otp = ${otp}
      AND otp_expires_at > NOW()
    LIMIT 1
  `;
  if (rows.length === 0) return null;

  // Mark verified and clear OTP
  await sql`
    UPDATE users 
    SET email_verified = true, verification_otp = NULL, otp_expires_at = NULL
    WHERE LOWER(email) = LOWER(${email})
  `;

  return rows[0] as unknown as NeonUser;
}

export async function neonUpsertGoogleUser({
  name,
  email,
  google_id,
}: {
  name: string;
  email: string;
  google_id: string;
}): Promise<Omit<NeonUser, 'password_hash'>> {
  if (!sql) throw new Error('Database not connected');

  const existing = await neonFindUserByEmail(email);
  if (existing) {
    await sql`
      UPDATE users 
      SET google_id = ${google_id}, email_verified = true 
      WHERE LOWER(email) = LOWER(${email})
    `;
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      role: existing.role,
      email_verified: true,
      created_at: existing.created_at,
    };
  }

  // Create new user via Google OAuth
  const dummyHash = '$google_oauth_user_no_password$';
  const rows = await sql`
    INSERT INTO users (name, email, password_hash, role, email_verified, google_id)
    VALUES (${name}, LOWER(${email}), ${dummyHash}, 'mahasiswa', true, ${google_id})
    RETURNING id, name, email, role, email_verified, created_at
  `;

  return rows[0] as unknown as Omit<NeonUser, 'password_hash'>;
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
      COALESCE(r.status, 'menunggu') AS status,
      r.feedback,
      r.feedback_by,
      r.priority, r.processed_at, r.deadline_at, r.feedback_at,
      r.created_at,
      u.name AS user_name,
      fb.name AS feedback_by_name
    FROM reports r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN users fb ON r.feedback_by = fb.id
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
export async function neonGetReports(q = '', category = '', status = '') {
  if (!sql) return [];

  const searchPattern = q ? `%${q}%` : '';

  if (category && category !== 'Semua') {
    if (q) {
      return (await sql`
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
          COALESCE(r.status, 'menunggu') AS status,
          r.feedback,
          r.feedback_by,
          r.priority, r.processed_at, r.deadline_at, r.feedback_at,
          r.created_at,
          f.name AS facility_name,
          f.building AS facility_building,
          u.name AS user_name,
          fb.name AS feedback_by_name
        FROM reports r
        LEFT JOIN facilities f ON r.facility_id = f.id
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN users fb ON r.feedback_by = fb.id
        WHERE r.category = ${category}
          AND (r.title ILIKE ${searchPattern} OR r.description ILIKE ${searchPattern})
        ORDER BY r.created_at DESC
      `) as Report[];
    } else {
      return (await sql`
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
          COALESCE(r.status, 'menunggu') AS status,
          r.feedback,
          r.feedback_by,
          r.priority, r.processed_at, r.deadline_at, r.feedback_at,
          r.created_at,
          f.name AS facility_name,
          f.building AS facility_building,
          u.name AS user_name,
          fb.name AS feedback_by_name
        FROM reports r
        LEFT JOIN facilities f ON r.facility_id = f.id
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN users fb ON r.feedback_by = fb.id
        WHERE r.category = ${category}
        ORDER BY r.created_at DESC
      `) as Report[];
    }
  }

  if (q) {
    return (await sql`
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
        COALESCE(r.status, 'menunggu') AS status,
        r.feedback,
        r.feedback_by,
        r.priority, r.processed_at, r.deadline_at, r.feedback_at,
        r.created_at,
        f.name AS facility_name,
        f.building AS facility_building,
        u.name AS user_name,
        fb.name AS feedback_by_name
      FROM reports r
      LEFT JOIN facilities f ON r.facility_id = f.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN users fb ON r.feedback_by = fb.id
      WHERE (r.title ILIKE ${searchPattern} OR r.description ILIKE ${searchPattern})
      ORDER BY r.created_at DESC
    `) as Report[];
  }

  return (await sql`
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
      COALESCE(r.status, 'menunggu') AS status,
      r.feedback,
      r.feedback_by,
      r.priority, r.processed_at, r.deadline_at, r.feedback_at,
      r.created_at,
      f.name AS facility_name,
      f.building AS facility_building,
      u.name AS user_name,
      fb.name AS feedback_by_name
    FROM reports r
    LEFT JOIN facilities f ON r.facility_id = f.id
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN users fb ON r.feedback_by = fb.id
    ORDER BY r.created_at DESC
  `) as Report[];
}

export async function neonGetReportsByUserId(userId: string) {
  if (!sql) return [];
  return (await sql`
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
      COALESCE(r.status, 'menunggu') AS status,
      r.feedback,
      r.feedback_by,
      r.priority, r.processed_at, r.deadline_at, r.feedback_at,
      r.created_at,
      f.name AS facility_name,
      f.building AS facility_building,
      u.name AS user_name,
      fb.name AS feedback_by_name
    FROM reports r
    LEFT JOIN facilities f ON r.facility_id = f.id
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN users fb ON r.feedback_by = fb.id
    WHERE r.user_id = ${userId}
    ORDER BY r.created_at DESC
  `) as Report[];
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
      COALESCE(r.status, 'menunggu') AS status,
      r.feedback,
      r.feedback_by,
      r.priority, r.processed_at, r.deadline_at, r.feedback_at,
      r.created_at,
      f.name AS facility_name,
      f.building AS facility_building,
      u.name AS user_name,
      fb.name AS feedback_by_name
    FROM reports r
    LEFT JOIN facilities f ON r.facility_id = f.id
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN users fb ON r.feedback_by = fb.id
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
      user_id, facility_id, category, title, description, photo_url, latitude, longitude, status
    ) VALUES (
      ${data.user_id}, 
      ${data.facility_id}, 
      ${data.category}, 
      ${data.title}, 
      ${data.description}, 
      ${data.photo_url || null}, 
      ${data.latitude !== undefined ? data.latitude : null}, 
      ${data.longitude !== undefined ? data.longitude : null},
      'menunggu'
    )
    RETURNING id
  `;

  if (!inserted || inserted.length === 0) return null;
  return neonGetReportById(inserted[0].id);
}

export async function neonUpdateReport(id: string, updates: any) {
  if (!sql) return null;

  await sql`
    UPDATE reports SET
      facility_id = COALESCE(${updates.facility_id || null}, facility_id),
      category = COALESCE(${updates.category || null}, category),
      title = COALESCE(${updates.title || null}, title),
      description = COALESCE(${updates.description || null}, description),
      photo_url = COALESCE(${updates.photo_url !== undefined ? updates.photo_url : null}, photo_url),
      latitude = COALESCE(${updates.latitude !== undefined ? updates.latitude : null}, latitude),
      longitude = COALESCE(${updates.longitude !== undefined ? updates.longitude : null}, longitude),
      status = COALESCE(${updates.status || null}, status),
      feedback = COALESCE(${updates.feedback || null}, feedback)
    WHERE id = ${id}
  `;

  return neonGetReportById(id);
}

export async function neonUpdateReportFeedback(
  id: string,
  feedback: string,
  status: ReportStatus,
  birokrasiUserId: string,
  priority: ReportPriority = 'sedang'
) {
  if (!sql) return null;

  const days = priority === 'tinggi' ? 3 : priority === 'rendah' ? 7 : 5;
  const nowIso = new Date().toISOString();
  const deadlineIso = new Date(Date.now() + days * 86400000).toISOString();

  if (status === 'diproses') {
    await sql`
      UPDATE reports SET
        feedback = ${feedback},
        status = ${status},
        priority = ${priority},
        processed_at = ${nowIso},
        deadline_at = ${deadlineIso},
        feedback_by = ${birokrasiUserId},
        feedback_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE reports SET
        feedback = ${feedback},
        status = ${status},
        priority = COALESCE(${priority}, priority),
        feedback_by = ${birokrasiUserId},
        feedback_at = NOW()
      WHERE id = ${id}
    `;
  }

  return neonGetReportById(id);
}

export async function neonDeleteReport(id: string) {
  if (!sql) return false;
  await sql`DELETE FROM reports WHERE id = ${id}`;
  return true;
}
