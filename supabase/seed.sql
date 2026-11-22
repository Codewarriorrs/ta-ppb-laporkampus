-- ========================================================
-- LaporKampus Seed Data (Supabase / PostgreSQL)
-- Data awal untuk demonstrasi aplikasi Tugas Akhir
-- ========================================================

-- 1. Seed User Contoh
-- Password: password123 (Hash bcrypt)
INSERT INTO users (id, name, email, password_hash) VALUES
('a0000000-0000-0000-0000-000000000001', 'Ahmad Zaidan', 'zaidan@kampus.ac.id', '$2a$10$5M8pM4bV3sHj6gXmDqK8ce7LqK1G0fD7.aG0Zk1p6xZ9e2g3jK5h2'),
('a0000000-0000-0000-0000-000000000002', 'Budi Santoso', 'budi@kampus.ac.id', '$2a$10$5M8pM4bV3sHj6gXmDqK8ce7LqK1G0fD7.aG0Zk1p6xZ9e2g3jK5h2')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed 10 Fasilitas Kampus
INSERT INTO facilities (id, name, building, description, image_url) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'Laboratorium Pemrograman & AI',
    'Gedung Elektro Lt. 3',
    'Laboratorium komputer dengan 40 unit PC untuk praktikum pemrograman, kecerdasan buatan, dan multimedia.',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'Perpustakaan Pusat Kampus',
    'Gedung Rektorat Lt. 2',
    'Pusat referensi buku, jurnal internasional, ruang belajar tenang, dan ruang diskusi mahasiswa.',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000003',
    'Ruang Kuliah 204 (GKB)',
    'Gedung Kuliah Bersama Lt. 2',
    'Ruang kelas berkapasitas 60 mahasiswa dengan proyektor ganda, pendingin ruangan, dan papan tulis elektrik.',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000004',
    'Toilet Pria & Wanita Lt. 1 GKB',
    'Gedung Kuliah Bersama Lt. 1',
    'Fasilitas sanitasi utama lantai dasar dengan 6 bilik toilet, wastafel otomatis, dan cermin.',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000005',
    'Kantin Utama Kampus',
    'Pusat Kegiatan Mahasiswa (PKM)',
    'Area pujasera kampus berkapasitas 200 kursi menyediakan berbagai hidangan makanan dan minuman higienis.',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000006',
    'Masjid Al-Hikmah Kampus',
    'Kompleks Pusat Ibadah',
    'Masjid utama kampus dengan kapasitas 500 jamaah, berpendingin AC, area wudhu luas, dan sound system modern.',
    'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000007',
    'Auditorium Utama & Ruang Seminar',
    'Gedung Serbaguna Lt. 1',
    'Ruang pertemuan berkapasitas 300 orang untuk seminar nasional, kuliah umum, dan kegiatan kemahasiswaan.',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000008',
    'Laboratorium Jaringan & IoT',
    'Gedung Informatika Lt. 2',
    'Laboratorium praktikum jaringan komputer, perangkat switch/router Cisco, dan instrumen sensor IoT.',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000009',
    'Lapangan Futsal & Olahraga',
    'Kompleks Olahraga Mahasiswa',
    'Lapangan olahraga serbaguna dengan penerangan malam hari untuk futsal, basket, dan bola voli.',
    'https://images.unsplash.com/photo-1529900241929-5ed53a431536?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000010',
    'Ruang Kuliah 301 (Gedung B)',
    'Gedung Teknik Sipil Lt. 3',
    'Ruang kelas berkapasitas 50 kursi ergonomis, proyektor LCD, dan konektivitas WiFi edukasi.',
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed 5 Contoh Laporan Kerusakan
INSERT INTO reports (id, user_id, facility_id, category, title, description, photo_url, latitude, longitude, created_at) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'AC',
    'AC di Lab Komputer Mati dan Mengeluarkan Bau Hangus',
    'AC unit nomor 2 di sisi timur lab mati tiba-tiba saat praktikum berlangsung dan mengeluarkan sedikit bau asap. Mohon teknisi segera memeriksa.',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    -7.050410,
    110.435120,
    NOW() - INTERVAL '2 hours'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000003',
    'Proyektor',
    'Proyektor LCD Ruang 204 Berkedip dan Tampilan Kuning',
    'Tampilan proyektor tidak stabil, warna layar menguning dan bergaris tebal sehingga presentasi kuliah sangat sulit dibaca.',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    -7.050890,
    110.435550,
    NOW() - INTERVAL '5 hours'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000004',
    'Toilet',
    'Kran Wastafel Rusak dan Mengalirkan Air Terus',
    'Kran wastafel ketiga di toilet pria tidak bisa ditutup rapat sehingga membuang air bersih dan membasahi lantai sekitarnya.',
    'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?auto=format&fit=crop&w=800&q=80',
    -7.051120,
    110.435780,
    NOW() - INTERVAL '1 day'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000002',
    'Jaringan/WiFi',
    'Koneksi Akses Poin WiFi di Meja Belajar Putus-Putus',
    'Sinyal WiFi kampus (SSID: Edu-WiFi) di area pojok timur perpustakaan sering Request Time Out (RTO) dan tidak bisa login captive portal.',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    -7.050630,
    110.434910,
    NOW() - INTERVAL '2 days'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000008',
    'Lampu',
    'Lampu Neon Tengah Lab IoT Mati Total',
    '2 lampu tabung di tengah ruangan mati sehingga ruangan praktikum menjadi remang saat praktikum sore hari.',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
    -7.050350,
    110.435340,
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;
