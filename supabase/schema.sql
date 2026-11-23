-- ========================================================
-- LaporKampus Database Schema (Supabase / PostgreSQL)
-- ========================================================

-- Aktifkan ekstensi uuid-ossp (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'mahasiswa',
    email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    verification_otp VARCHAR(6),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'mahasiswa';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_otp VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Tabel Facilities (Fasilitas Kampus)
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    building VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Reports (Laporan Kerusakan Fasilitas)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'AC', 'Lampu', 'Kursi/Meja', 'Toilet', 'Proyektor', 'Jaringan/WiFi', 'Lainnya'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing untuk mempercepat query pencarian, filter, dan join
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_facility_id ON reports(facility_id);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ========================================================
-- Konfigurasi Supabase Storage Bucket "reports"
-- ========================================================
-- Catatan: Eksekusi di Supabase SQL Editor jika belum dibuat lewat dashboard:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy agar semua orang bisa membaca foto laporan secara publik
CREATE POLICY "Public Read Access for Reports Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports');

-- Policy agar service role / authenticated bisa mengunggah foto
CREATE POLICY "Allow Upload to Reports Bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports');
