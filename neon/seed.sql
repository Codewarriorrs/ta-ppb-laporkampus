-- ========================================================
-- LaporKampus Seed Data untuk NEON POSTGRESQL
-- Data Fasilitas & Laporan Departemen Teknik Komputer Undip
-- Kampus Tembalang, Semarang
-- ========================================================

-- 1. Seed User
-- budi@kampus.ac.id (birokrasi123)
-- zaidan@kampus.ac.id (mahasiswa123)
INSERT INTO users (id, name, email, password_hash, role, email_verified) VALUES
('a0000000-0000-0000-0000-000000000001', 'Ahmad Zaidan (Mahasiswa Tekkom)', 'zaidan@kampus.ac.id', '$2a$10$it/nPIgNiTKiOdvw5zX6SuXbipmlNL8NcOgNHsRl6eAYY9uUeQLi6', 'mahasiswa', true),
('a0000000-0000-0000-0000-000000000002', 'Ir. Bambang S., M.T. (Pengelola Sarpras)', 'budi@kampus.ac.id', '$2a$10$1lbUnSm1r5LfHElBnaYR3OpHjDtyxV/65JSewxOOWCNIVQrB5EuNi', 'birokrasi', true)
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role, 
  name = EXCLUDED.name, 
  password_hash = EXCLUDED.password_hash,
  email_verified = true;

-- 2. Seed 10 Fasilitas Departemen Teknik Komputer FT Undip
INSERT INTO facilities (id, name, building, description, image_url) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'Lab. Sistem Tertanam & Robotika',
    'Gedung Dept. Teknik Komputer Lt. 2',
    'Laboratorium praktikum sistem mikroprosesor, mikrokontroler AVR/STM32, instrumentasi sensor IoT, dan riset robotika otomasi industri.',
    'https://images.unsplash.com/photo-1517055729445-fa7d27394b48?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'Lab. Jaringan Komputer & Keamanan Siber',
    'Gedung Dept. Teknik Komputer Lt. 2',
    'Laboratorium infrastruktur jaringan komputer, switch & router Cisco, konfigurasi server Linux, praktikum perutean dan penetration testing keamanan jaringan.',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000003',
    'Lab. Rekayasa Perangkat Lunak',
    'Gedung Dept. Teknik Komputer Lt. 3',
    'Laboratorium pemrograman desktop, web, aplikasi bergerak (mobile), dan basis data dengan 40 workstation spesifikasi tinggi.',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000004',
    'Lab. Multimedia & Pengolahan Sinyal',
    'Gedung Dept. Teknik Komputer Lt. 3',
    'Laboratorium pengolahan citra digital, computer vision, sistem multimedia, kecerdasan buatan, dan komputasi grafis GPU.',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000005',
    'Ruang Kuliah Teori TK-101',
    'Gedung Dept. Teknik Komputer Lt. 1',
    'Ruang kuliah berkapasitas 55 mahasiswa dengan proyektor laser LCD, pendingin ruangan ganda (AC), dan koneksi WiFi SIFT Undip.',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000006',
    'Ruang Kuliah Teori TK-102',
    'Gedung Dept. Teknik Komputer Lt. 1',
    'Ruang perkuliahan interaktif dilengkapi smart podium, sound system terintegrasi, papan tulis kaca magnetik, dan 50 kursi kuliah ergonomis.',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000007',
    'Ruang Sidang Tugas Akhir & Seminar',
    'Gedung Dept. Teknik Komputer Lt. 2',
    'Ruang sidang tertutup untuk ujian seminar proposal, sidang tugas akhir sarjana, dan rapat pleno kurikulum departemen.',
    'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000008',
    'Ruang Baca & Referensi Teknik Komputer',
    'Gedung Dept. Teknik Komputer Lt. 2',
    'Area studi mandiri dan ruang baca literatur tugas akhir, repositori skripsi mahasiswa, serta jurnal IEEE / ACM.',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000009',
    'Toilet Mahasiswa & Dosen Lt. 2',
    'Gedung Dept. Teknik Komputer Lt. 2',
    'Fasilitas sanitasi toilet pria dan wanita lantai 2 dengan wastafel otomatis, hand dryer, dan cermin dinding.',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
),
(
    'f0000000-0000-0000-0000-000000000010',
    'Gedung Kuliah Bersama (GKB) FT Undip',
    'Kompleks Gedung Kuliah Bersama Tembalang',
    'Ruang kuliah bersama fakultas teknik untuk mata kuliah umum dasar, matematika rekayasa, dan fisika komputasi.',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  building = EXCLUDED.building,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- 3. Seed 5 Laporan Kerusakan Terkait Sarpras Teknik Komputer Undip
INSERT INTO reports (id, user_id, facility_id, category, title, description, photo_url, latitude, longitude, status, feedback, feedback_by, feedback_at, created_at) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000002',
    'Jaringan/WiFi',
    'Akses Poin WiFi SIFT di Lab Jaringan RTO dan Tidak Dapat IP',
    'Akses poin WiFi di dekat rak server Lab Jaringan Komputer sering mengalami Request Time Out (RTO) dan mahasiswa praktikum tidak mendapat IP address dari DHCP server.',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    -7.050410,
    110.435120,
    'diproses',
    'Laporan diterima oleh Tim Sarpras Tekkom. Staf IT sedang melakukan restart controller switch core dan konfigurasi ulang pool DHCP.',
    'a0000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '3 hours'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000005',
    'Proyektor',
    'Proyektor Ruang TK-101 Tampilan Kuning & Port HDMI Longgar',
    'Tampilan proyektor di ruang kuliah TK-101 berkedip dan warnanya menguning. Konektor kabel HDMI di podium dosen juga longgar sehingga sering putus layar saat kuliah umum.',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    -7.050890,
    110.435550,
    'selesai',
    'Kabel splitter HDMI dan modul input proyektor telah diganti dengan suku cadang baru oleh tendik sarpras.',
    'a0000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '6 hours'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'AC',
    'AC Sisi Timur Lab Sistem Tertanam Bocor dan Menetes ke Meja Praktikum',
    'Unit pendingin AC di atas meja praktikum osiloskop meneteskan air ke meja sehingga berisiko mengenai modul mikrokontroler mahasiswa.',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    -7.050350,
    110.435340,
    'menunggu',
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '1 day'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000009',
    'Toilet',
    'Kran Wastafel Toilet Pria Lt. 2 Dol dan Air Mengalir Terus',
    'Kran wastafel nomor 2 di toilet pria lantai 2 Teknik Komputer tidak dapat ditutup rapat sehingga air bersih terbuang terus-menerus.',
    'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?auto=format&fit=crop&w=800&q=80',
    -7.051120,
    110.435780,
    'menunggu',
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '2 days'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000006',
    'Kursi/Meja',
    'Papan Sandaran 3 Kursi Kuliah di Ruang TK-102 Retak',
    'Tiga kursi kuliah beroda baris belakang di ruang TK-102 memiliki sandaran yang patah dan baut meja lepas, berbahaya saat diduduki.',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    -7.050630,
    110.434910,
    'menunggu',
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  facility_id = EXCLUDED.facility_id,
  category = EXCLUDED.category,
  photo_url = EXCLUDED.photo_url,
  status = EXCLUDED.status,
  feedback = EXCLUDED.feedback,
  feedback_by = EXCLUDED.feedback_by,
  feedback_at = EXCLUDED.feedback_at;
