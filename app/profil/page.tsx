'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { User } from '@/types';
import { usePwa } from '@/components/pwa/PwaProvider';
import { 
  User as UserIcon, 
  Mail, 
  Download, 
  CheckCircle2, 
  LogOut, 
  Info, 
  GraduationCap,
  Layers, 
  Loader2,
  ExternalLink
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { isInstallable, isInstalled, installApp } = usePwa();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await installApp();
      if (accepted) {
        setInstallSuccess(true);
      }
    } else {
      alert(
        'Untuk menginstal di browser seluler (Chrome/Safari), ketuk menu browser lalu pilih "Tambahkan ke Layar Utama" (Add to Home screen).'
      );
    }
  };

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari akun?')) return;
    setLoggingOut(true);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      alert('Gagal logout. Silakan coba lagi.');
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="Profil Akun & Aplikasi" />

      <div className="flex-1 p-4 md:py-6 max-w-2xl mx-auto w-full space-y-4">
        {/* Identitas Mahasiswa Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-6 h-6" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 truncate">
                  {loading ? 'Memuat data...' : user?.name || 'Mahasiswa'}
                </h2>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Pelapor Aktif
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 truncate">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate">{user?.email || 'email@kampus.ac.id'}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <GraduationCap className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span>Sivitas Akademika Kampus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Instalasi PWA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Aplikasi Web Progresif (PWA)
              </h3>
            </div>
            {isInstalled && (
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                Terpasang
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Aplikasi ini mendukung instalasi PWA ke layar beranda smartphone atau sistem operasi desktop untuk akses offline dan kecepatan render maksimal.
          </p>

          {isInstalled || installSuccess ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5 text-slate-700 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>LaporKampus telah terpasang di perangkat ini.</span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>
                {isInstallable ? 'Install Aplikasi ke Perangkat' : 'Panduan Pasang PWA'}
              </span>
            </button>
          )}
        </div>

        {/* Section About Aplikasi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tentang Aplikasi
            </h3>
          </div>

          <div className="text-xs text-slate-700 divide-y divide-slate-100">
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Nama Perangkat Lunak</span>
              <span className="font-semibold text-slate-900">LaporKampus</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Versi Rilis</span>
              <span className="font-mono text-slate-800">1.0.0 (Production)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Kurikulum</span>
              <span className="text-slate-800">Tugas Akhir Praktikum PPB 2026</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Arsitektur</span>
              <span className="text-slate-800">Next.js 14 App Router + Supabase + PWA</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Geospasial</span>
              <span className="text-slate-800">Leaflet & OpenStreetMap API</span>
            </div>
          </div>
        </div>

        {/* Tombol Logout: Clean Danger Action */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-2.5 px-4 bg-white hover:bg-red-50 active:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                <span>Memproses Logout...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun (Logout)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
