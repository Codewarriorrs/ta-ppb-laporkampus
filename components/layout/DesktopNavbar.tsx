'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Building2, Plus, FileText, User, LogOut, LayoutDashboard } from 'lucide-react';
import { UserRole } from '@/types';
import AppLogo from '@/components/ui/AppLogo';

export default function DesktopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<{ name: string; role?: UserRole } | null>(null);

  // Hook dipanggil di level paling atas agar tidak melanggar aturan Hooks
  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') return;

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setUserData({ name: res.data.name, role: res.data.role });
        }
      })
      .catch(() => {});
  }, [pathname]);

  // Sembunyikan navbar di halaman login & register
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari akun?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUserData(null);
      router.push('/login');
      router.refresh();
    } catch {
      alert('Gagal logout.');
    }
  };

  const isBirokrasi = userData?.role === 'birokrasi';

  const navLinks = [
    { href: isBirokrasi ? '/birokrasi' : '/', label: isBirokrasi ? 'Dashboard' : 'Beranda', icon: isBirokrasi ? LayoutDashboard : Home, active: isBirokrasi ? pathname.startsWith('/birokrasi') : pathname === '/' },
    { href: '/fasilitas', label: 'Fasilitas', icon: Building2, active: pathname.startsWith('/fasilitas') },
    ...(!isBirokrasi
      ? [{ href: '/laporan-saya', label: 'Laporan Saya', icon: FileText, active: pathname === '/laporan-saya' }]
      : []),
    { href: '/profil', label: 'Profil', icon: User, active: pathname === '/profil' },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200/70 shadow-soft-3d">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Soft 3D App Logo */}
        <AppLogo size="md" href={isBirokrasi ? '/birokrasi' : '/'} />

        {/* Navigation Menu */}
        <nav className="flex items-center gap-2 bg-neutral-100/80 p-1.5 rounded-[20px] border border-neutral-200/50">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-[16px] text-xs font-bold whitespace-nowrap transition-all ${
                  item.active
                    ? 'text-primary bg-white shadow-soft-3d font-extrabold'
                    : 'text-neutral-600 hover:text-primary hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'stroke-[2.5px] text-primary' : 'stroke-[2px]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions Kanan */}
        <div className="flex items-center gap-3">
          {!isBirokrasi && (
            <Link
              href="/lapor"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs font-bold rounded-[18px] transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Buat Laporan</span>
            </Link>
          )}

          {userData && (
            <div className="flex items-center gap-2 pl-3 border-l border-neutral-200/80">
              <Link
                href="/profil"
                className="flex items-center gap-2 px-3 py-1.5 rounded-[16px] hover:bg-neutral-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-neutral-800 leading-tight truncate max-w-[110px]">
                    {userData.name}
                  </p>
                  <p className="text-[10px] text-neutral-400 capitalize font-medium">
                    {userData.role || 'Mahasiswa'}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-2 text-neutral-400 hover:text-danger hover:bg-danger/10 rounded-[12px] transition-colors"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
