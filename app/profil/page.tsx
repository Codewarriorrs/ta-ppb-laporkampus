'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { User, JWTPayload } from '@/types';
import { usePwa } from '@/components/pwa/PwaProvider';
import { 
  User as UserIcon, 
  Mail, 
  Download, 
  CheckCircle2, 
  LogOut, 
  Info, 
  ShieldCheck, 
  Code2, 
  Layers, 
  Calendar,
  Sparkles,
  Loader2
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
        'Untuk menginstal di browser seluler (Chrome/Safari), ketuk menu titik tiga (atau tombol Bagikan) lalu pilih "Tambahkan ke Layar Utama" (Add to Home screen).'
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
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <AppHeader title="Profil Pengguna" />

      <div className="flex-1 p-4 space-y-4 pb-12">
        {/* User Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-8 h-8" />}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold text-gray-900 truncate">
                {loading ? 'Memuat data...' : user?.name || 'Mahasiswa'}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 truncate">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                <span className="truncate">{user?.email || 'email@kampus.ac.id'}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <ShieldCheck className="w-3 h-3" />
                <span>Akun Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section PWA Install */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Aplikasi LaporKampus (PWA)
            </h3>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Pasang LaporKampus ke layar beranda smartphone atau desktop Anda agar dapat diakses cepat layaknya aplikasi mobile native.
          </p>

          {isInstalled || installSuccess ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Aplikasi sudah terpasang di perangkat Anda!</span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>
                {isInstallable ? 'Install Aplikasi ke Layar Utama' : 'Petunjuk Install PWA'}
              </span>
            </button>
          )}
        </div>

        {/* Section About */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Tentang Aplikasi
            </h3>
          </div>

          <div className="space-y-2 text-xs text-gray-600 divide-y divide-gray-100">
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Nama Aplikasi</span>
              <span className="font-bold text-gray-900">LaporKampus</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Versi</span>
              <span className="font-mono font-medium text-gray-700">v1.0.0 (PWA)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Kategori Tugas</span>
              <span className="font-medium text-gray-900 text-right">
                Tugas Akhir Praktikum PPB
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Arsitektur</span>
              <span className="font-medium text-gray-900">Next.js App Router + PWA</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Basis Data & Storage</span>
              <span className="font-medium text-gray-900">Supabase (PostgreSQL)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Mesin Peta</span>
              <span className="font-medium text-gray-900">Leaflet + OpenStreetMap</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 pt-1 leading-relaxed">
            Aplikasi LaporKampus dirancang khusus dengan filosofi Mobile-First untuk memudahkan mahasiswa dan seluruh sivitas akademika melaporkan segala bentuk kerusakan fasilitas secara cepat, transparan, dan akurat.
          </p>
        </div>

        {/* Tombol Logout */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-3 bg-red-50 hover:bg-red-100 active:scale-95 text-red-700 border border-red-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {loggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Keluar dari Akun...</span>
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
