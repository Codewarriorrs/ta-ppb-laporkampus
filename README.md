# 🏛️ LaporKampus - Progressive Web App (PWA)

> **Tugas Akhir Praktikum Pemrograman Perangkat Bergerak (PPB)**  
> Sistem Informasi Pelaporan Kerusakan Sarana dan Prasarana Fasilitas Kampus Berbasis Web Mobile-First.

---

## 📱 Tentang Aplikasi

**LaporKampus** adalah aplikasi Progressive Web App (PWA) yang dirancang untuk memudahkan mahasiswa dan sivitas akademika dalam menyampaikan laporan kerusakan fasilitas kampus (seperti AC rusak, proyektor mati, kursi patah, masalah sanitasi toilet, dan gangguan jaringan WiFi).

Aplikasi dibangun dengan pendekatan **Mobile-First** (optimal pada layar smartphone 360px–430px dan terpusat rapi di desktop maksimal 480px) dan memiliki kapabilitas instalasi langsung ke layar beranda (*Add to Home Screen*) tanpa melalui App Store/Play Store.

---

## 🚀 Fitur Utama

1. **Mobile-First Responsive Layout**:
   - Tampilan adaptif mobile menyerupai aplikasi Android/iOS native.
   - **Fixed Bottom Navigation Bar (5 Tab):** Beranda, Fasilitas, Lapor (tombol tengah menonjol), Laporan Saya, dan Profil.
2. **Katalog & Detail Fasilitas**:
   - Daftar gedung, laboratorium, ruang kelas, toilet, masjid, dan kantin kampus.
   - Halaman detail fasilitas lengkap dengan riwayat laporan kerusakan terkait.
3. **Formulir Pelaporan Kerusakan**:
   - Pemilihan fasilitas dan kategori kerusakan (AC, Lampu, Kursi/Meja, Toilet, Proyektor, Jaringan/WiFi, Lainnya).
   - **Kamera Langsung & Galeri**: Pengambilan foto bukti kerusakan via kamera smartphone (`capture="environment"`).
   - **Geolocation GPS Sensor**: Tombol *"Gunakan lokasi saya"* untuk mendeteksi koordinat lintang & bujur perangkat secara otomatis.
   - **Peta Interaktif Leaflet**: Pin lokasi interaktif berbasis OpenStreetMap yang dapat digeser secara presisi.
4. **Riwayat & Manajemen Laporan Saya**:
   - Mahasiswa dapat memantau laporan yang pernah dibuat.
   - Memiliki hak akses khusus untuk mengubah (**Edit**) dan menghapus (**Hapus**) laporan milik sendiri.
5. **Autentikasi & Keamanan (Custom Auth)**:
   - Registrasi dan Login akun mahasiswa.
   - Password di-hash menggunakan algoritma `bcryptjs`.
   - Manajemen sesi aman menggunakan JSON Web Token (`jose`) pada cookie `httpOnly`.
   - Next.js Middleware untuk melindungi rute privat.
6. **Progressive Web App (PWA Standalone Manual)**:
   - `app/manifest.ts`: Metadata PWA lengkap dengan tema warna biru (`#2563eb`), ikon 192x192 & 512x512 maskable.
   - `public/sw.js`: Service Worker kustom untuk caching App Shell, navigasi Network-First, dan caching Stale-While-Revalidate untuk aset statis.
   - Halaman fallback `/offline` jika jaringan internet terputus.
   - Penanganan event `beforeinstallprompt` untuk tombol instalasi di halaman profil.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Lucide React Icons
- **Database & Storage:** Supabase (PostgreSQL & Supabase Storage bucket `reports`)
- **Autentikasi:** Custom JWT Auth (`jose`) + `bcryptjs` + HTTP-Only Cookie
- **Pemetaan:** Leaflet + OpenStreetMap (`react-leaflet`, dynamic import tanpa SSR)
- **Validasi Data:** Zod
- **PWA Engine:** Native Web App Manifest & Custom Service Worker

---

## 🗄️ Struktur Proyek

```text
ta-ppb-lapor-kampus/
├── app/
│   ├── api/                     # RESTful Route Handlers
│   │   ├── auth/                # register, login, logout, me
│   │   ├── facilities/          # list fasilitas & detail fasilitas
│   │   ├── reports/             # list laporan, post, mine, [id] (GET, PUT, DELETE)
│   │   └── upload/              # upload foto ke Supabase Storage
│   ├── fasilitas/               # Halaman list & detail fasilitas
│   ├── laporan/                 # Halaman detail & edit laporan
│   ├── laporan-saya/            # Halaman riwayat laporan user
│   ├── lapor/                   # Halaman formulir pelaporan + kamera + GPS
│   ├── login/ & register/       # Halaman autentikasi
│   ├── offline/                 # Halaman fallback offline PWA
│   ├── profil/                  # Halaman profil, info app, & install PWA
│   ├── globals.css              # Global styles & mobile safe area
│   ├── layout.tsx               # Root Layout frame 480px + BottomNav
│   ├── manifest.ts              # Web App Manifest PWA
│   └── page.tsx                 # Beranda feed laporan & pencarian
├── components/
│   ├── layout/                  # BottomNav, AppHeader
│   ├── map/                     # CampusMap (Leaflet), DynamicMap
│   ├── pwa/                     # PwaProvider (SW & beforeinstallprompt)
│   ├── report/                  # ReportCard, CategoryBadge
│   └── ui/                      # Skeleton loader, EmptyState
├── lib/
│   ├── auth.ts                  # Helper hash bcrypt, sign & verify JWT
│   └── supabase.ts              # Client server-side Supabase Service Role
├── public/
│   ├── icons/                   # Ikon PWA (192, 512, maskable, apple-touch)
│   ├── favicon.ico
│   └── sw.js                    # Service Worker kustom
├── supabase/
│   ├── schema.sql               # Skema tabel database PostgreSQL
│   └── seed.sql                 # Data awal 10 fasilitas & 5 laporan contoh
├── .env.example
├── middleware.ts                # Route protection middleware
└── package.json
```

---

## 🔌 Dokumentasi RESTful API Endpoints

Semua endpoint mengembalikan respons dengan format standar JSON:
```json
{
  "success": true,
  "data": { ... },
  "message": "Pesan deskriptif"
}
```

| Method | Endpoint | Deskripsi | Hak Akses |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Mendaftarkan akun baru (nama, email, password) | Publik |
| **POST** | `/api/auth/login` | Masuk dan menerbitkan cookie sesi JWT | Publik |
| **POST** | `/api/auth/logout` | Menghapus cookie sesi | Publik |
| **GET** | `/api/auth/me` | Mengambil data sesi pengguna aktif | Terotentikasi |
| **GET** | `/api/facilities` | Mengambil daftar fasilitas beserta jumlah laporannya | Publik / User |
| **GET** | `/api/facilities/[id]` | Mengambil detail fasilitas dan laporan terkait | Publik / User |
| **GET** | `/api/reports` | Mengambil semua laporan (Filter: `?q=`, `?category=`) | Publik / User |
| **POST** | `/api/reports` | Mengirim laporan kerusakan baru | Terotentikasi |
| **GET** | `/api/reports/mine` | Mengambil daftar laporan milik user yang login | Terotentikasi |
| **GET** | `/api/reports/[id]` | Mengambil detail satu laporan | Publik / User |
| **PUT** | `/api/reports/[id]` | Memperbarui isi laporan | Pemilik Laporan |
| **DELETE** | `/api/reports/[id]` | Menghapus laporan | Pemilik Laporan |
| **POST** | `/api/upload` | Mengunggah foto bukti ke Supabase Storage (maks 5MB) | Terotentikasi |

---

## ⚙️ Panduan Setup Database di Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan buat proyek baru (*New Project*).
2. Masuk ke menu **SQL Editor** di panel kiri.
3. Buka file `supabase/schema.sql` di proyek ini, salin seluruh kodenya, lalu klik **Run**.
4. Buka file `supabase/seed.sql`, salin kodenya, lalu klik **Run** untuk memasukkan 10 fasilitas kampus dan 5 laporan contoh.
5. Masuk ke menu **Storage**:
   - Pastikan bucket bernama `reports` telah dibuat dengan status **Public Bucket** aktif.
6. Masuk ke menu **Project Settings** -> **API**:
   - Salin **Project URL** (`SUPABASE_URL`).
   - Salin **service_role secret key** (`SUPABASE_SERVICE_ROLE_KEY`).

## ✉️ Konfigurasi Verifikasi Email

Kode OTP dikirim melalui Brevo. Isi `BREVO_API_KEY` dengan API key aktif dan `BREVO_SENDER_EMAIL` dengan alamat pengirim yang sudah diverifikasi di Brevo, baik pada `.env.local` maupun Environment Variables hosting. Setelah mengubah environment variables, restart atau deploy ulang aplikasi. Tanpa konfigurasi valid, akun tetap dibuat sebagai belum terverifikasi dan aplikasi akan menampilkan bahwa email gagal dikirim; kode OTP hanya ditampilkan dalam mode development untuk pengujian.

Saat menggunakan Neon atau Supabase, jalankan skema database terbaru (`neon/schema.sql` atau `supabase/schema.sql`) agar kolom `email_verified`, `verification_otp`, dan `otp_expires_at` tersedia.

---

## 💻 Panduan Menjalankan di Komputer Lokal

1. **Masuk ke direktori proyek:**
   ```bash
   cd ta-ppb-lapor-kampus
   ```

2. **Buat file konfigurasi `.env.local`:**
   Salin dari template `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Lalu isi nilainya:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJh...
   JWT_SECRET=super-secret-jwt-key-lapor-kampus-min-32-chars-long-2026
   BREVO_API_KEY=xkeysib-your_real_api_key
   BREVO_SENDER_EMAIL=alamat-pengirim-terverifikasi@kampus.ac.id
   ```

3. **Install dependensi (jika belum):**
   ```bash
   npm install
   ```

4. **Jalankan server pengembangan lokal:**
   ```bash
   npm run dev
   ```
   Buka peramban di [http://localhost:3000](http://localhost:3000).

5. **Akun Pengujian Demo (dari seed data):**
   - **Email:** `zaidan@kampus.ac.id`
   - **Password:** `password123`
   *(Atau buat akun baru melalui halaman `/register`)*

---

## ☁️ Panduan Deploy ke Vercel (Free Hosting)

1. **Push proyek ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit LaporKampus PWA"
   git branch -M main
   git remote add origin https://github.com/username/ta-ppb-lapor-kampus.git
   git push -u origin main
   ```
2. Buka dashboard [Vercel](https://vercel.com) dan klik **Add New Project**.
3. Hubungkan repositori GitHub `ta-ppb-lapor-kampus`.
4. Pada bagian **Environment Variables**, tambahkan:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `BREVO_API_KEY`
   - `BREVO_SENDER_EMAIL`
5. Klik **Deploy**. Vercel akan otomatis melakukan proses build Next.js dan aplikasi siap diakses secara publik melalui protokol HTTPS (wajib untuk PWA & Geolocation API).
