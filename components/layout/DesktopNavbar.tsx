'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, Home, Building2, Plus, FileText, User, LogOut } from 'lucide-react';

export default function DesktopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  // Jangan tampilkan di halaman login dan register
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setUserName(res.data.name);
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
    { href: '/profil', label: 'Profil', icon: User, active: pathname === '/profil' },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo Kampus */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">LaporKampus</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                PWA Web
              </span>
            </div>
            <p className="text-xs text-slate-500">Sistem Pelaporan Sarana & Fasilitas</p>
          </div>
        </Link>

        {/* Navigasi Menu */}
        <nav className="flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'text-blue-600 bg-blue-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions Kanan */}
        <div className="flex items-center gap-3">
          <Link
            href="/lapor"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Laporan</span>
          </Link>

          {userName && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-900 line-clamp-1">{userName}</p>
                <p className="text-[10px] text-slate-400">Mahasiswa</p>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar (Logout)"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
