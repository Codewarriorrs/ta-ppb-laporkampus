-- ========================================================
-- LaporKampus Database Schema untuk NEON POSTGRESQL
-- Eksekusi file ini di SQL Editor pada Console Neon
-- ========================================================

-- Aktifkan ekstensi uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'mahasiswa', -- 'mahasiswa' atau 'birokrasi'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrasi kolom jika tabel sudah ada sebelumnya
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

-- 3. Tabel Reports (Laporan Kerusakan)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    status VARCHAR(50) NOT NULL DEFAULT 'menunggu', -- 'menunggu', 'diproses', 'selesai', 'ditolak'
    feedback TEXT, -- Tanggapan resmi dari pihak kampus / birokrasi
    feedback_by UUID REFERENCES users(id) ON DELETE SET NULL,
    feedback_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrasi kolom jika tabel sudah ada sebelumnya
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'menunggu';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS feedback_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS priority VARCHAR(20);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS deadline_at TIMESTAMP WITH TIME ZONE;

-- Indexing
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_facility_id ON reports(facility_id);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
