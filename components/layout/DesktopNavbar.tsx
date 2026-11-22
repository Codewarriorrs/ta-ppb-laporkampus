'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, Home, Building2, Plus, FileText, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { UserRole } from '@/types';

export default function DesktopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<{ name: string; role?: UserRole } | null>(null);

  // Jangan tampilkan di halaman login dan register
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setUserData({ name: res.data.name, role: res.data.role });
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari akun?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      alert('Gagal logout.');
    }
  };

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home, active: pathname === '/' },
    { href: '/fasilitas', label: 'Fasilitas Kampus', icon: Building2, active: pathname.startsWith('/fasilitas') },
    { href: '/laporan-saya', label: 'Laporan Saya', icon: FileText, active: pathname === '/laporan-saya' },
    { href: '/birokrasi', label: 'Dashboard Birokrasi', icon: LayoutDashboard, active: pathname.startsWith('/birokrasi'), highlight: true },
    { href: '/profil', label: 'Profil', icon: User, active: pathname === '/profil' },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-neutral-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo Kampus dengan warna Primary Toyota Blue */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 group-hover:bg-primary-dark transition-colors">
            <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-neutral-900 text-lg tracking-tight">LaporKampus</span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-neutral-100 text-primary rounded-md border border-neutral-200">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">Sistem Sarana & Prasarana Kampus</p>
          </div>
        </Link>

        {/* Navigasi Menu */}
        <nav className="flex items-center gap-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  item.active
                    ? 'text-primary bg-neutral-100/90 font-bold shadow-xs'
                    : 'text-neutral-700 hover:text-primary hover:bg-neutral-50'
                } ${item.highlight ? 'border border-primary/20 bg-primary/5 text-primary' : ''}`}
              >
                <Icon className={`w-4 h-4 ${item.active ? 'stroke-[2.5px] text-primary' : 'stroke-[1.8px]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions Kanan */}
        <div className="flex items-center gap-3">
          <Link
            href="/lapor"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 border border-primary/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Laporan</span>
          </Link>

          {userData && (
            <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-100">
              <div className="text-right">
                <p className="text-xs font-bold text-neutral-900 line-clamp-1">{userData.name}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    userData.role === 'birokrasi'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {userData.role === 'birokrasi' ? 'Birokrasi Kampus' : 'Mahasiswa'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar (Logout)"
                className="p-2 text-neutral-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
