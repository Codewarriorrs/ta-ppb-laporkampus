import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-[32px] p-6 sm:p-10 shadow-card-3d border border-white/80">
        <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
          <AppLogo size="sm" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="mt-8 space-y-6 text-neutral-800 font-sans">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-neutral-900 tracking-tight">
              Kebijakan Privasi (Privacy Policy)
            </h1>
          </div>

          <p className="text-xs text-neutral-400">
            Terakhir diperbarui: 22 November 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 font-display">1. Pendahuluan</h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Selamat datang di <strong>LaporKampus</strong>. Kami berkomitmen untuk melindungi informasi pribadi Anda dan hak privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan menjaga data Anda saat menggunakan aplikasi pelaporan fasilitas sarana prasarana kampus berbasis web.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 font-display">2. Informasi yang Kami Kumpulkan</h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Kami mengumpulkan informasi yang Anda berikan secara langsung saat menggunakan fitur kami:
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-neutral-600 space-y-2">
              <li>
                <strong>Data Akun Google OAuth:</strong> Jika Anda masuk menggunakan akun Google, kami hanya mengakses nama lengkap, alamat email, dan ID unik Google publik Anda untuk tujuan autentikasi dan pembuatan profil pengguna di aplikasi. Kami <em>tidak</em> meminta izin akses ke kontak, file Google Drive, atau email pribadi Anda.
              </li>
              <li>
                <strong>Data Registrasi Akun:</strong> Alamat email, nama lengkap, dan nomor identitas mahasiswa/staf saat Anda mendaftar melalui sistem verifikasi kode OTP email.
              </li>
              <li>
                <strong>Data Laporan Fasilitas:</strong> Judul kendala, deskripsi kerusakan sarpras, foto fasilitas yang diunggah, dan lokasi fasilitas yang dilaporkan.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 font-display">3. Penggunaan Informasi</h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Informasi yang dikumpulkan digunakan semata-mata untuk:
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-neutral-600 space-y-2">
              <li>Memverifikasi identitas pengguna dan menyediakan akses ke dashboard pelaporan.</li>
              <li>Menghubungkan laporan kerusakan fasilitas dengan pelapor agar pihak birokrasi sarana & prasarana kampus dapat memberikan tindak lanjut dan umpan balik status perbaikan.</li>
              <li>Mengirimkan notifikasi verifikasi akun melalui layanan email transaksi.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 font-display">4. Keamanan dan Perlindungan Data</h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Kami tidak pernah menjual, menyewakan, atau membagikan data identitas atau email pribadi Anda kepada pihak ketiga manapun untuk tujuan periklanan atau pemasaran. Semua komunikasi data login dienkripsi menggunakan protokol HTTPS dan JSON Web Token (JWT).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 font-display">5. Kontak Kami</h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau pengelolaan data Anda, Anda dapat menghubungi tim pengembang LaporKampus melalui layanan administrasi kampus Anda.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
