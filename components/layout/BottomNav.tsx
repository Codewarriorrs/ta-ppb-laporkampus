'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Plus, FileText, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Jangan tampilkan di halaman login dan register
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isFacilitiesActive = pathname.startsWith('/fasilitas');
  const isReportActive = pathname === '/lapor';
  const isMyReportsActive = pathname === '/laporan-saya';
  const isProfileActive = pathname === '/profil';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-transparent pointer-events-none">
      <div className="w-full max-w-[480px] bg-white border-t border-neutral-100 shadow-xl pointer-events-auto flex items-center justify-around px-2 py-2 pb-safe">
        {/* Tab 1: Beranda */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isHomeActive
              ? 'text-primary font-bold scale-105'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[11px] mt-1">Beranda</span>
        </Link>

        {/* Tab 2: Fasilitas */}
        <Link
          href="/fasilitas"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isFacilitiesActive
              ? 'text-primary font-bold scale-105'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Building2 className={`w-5 h-5 ${isFacilitiesActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[11px] mt-1">Fasilitas</span>
        </Link>

        {/* Tab 3: Lapor (Tombol Tengah Menonjol Bergaya Toyota Blue) */}
        <Link
          href="/lapor"
          className="flex flex-col items-center justify-center -mt-7 group focus:outline-none"
        >
          <div
            className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 ${
              isReportActive
                ? 'bg-primary-dark text-white ring-4 ring-primary/20 rotate-45'
                : 'bg-primary hover:bg-primary-dark text-white shadow-primary/30'
            }`}
          >
            <Plus className={`w-7 h-7 stroke-[2.5px] transition-transform ${isReportActive ? '-rotate-45' : ''}`} />
          </div>
          <span
            className={`text-[11px] mt-1 font-bold ${
              isReportActive ? 'text-primary' : 'text-neutral-700'
            }`}
          >
            Lapor
          </span>
        </Link>

        {/* Tab 4: Laporan Saya */}
        <Link
          href="/laporan-saya"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isMyReportsActive
              ? 'text-primary font-bold scale-105'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <FileText className={`w-5 h-5 ${isMyReportsActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[11px] mt-1">Laporan Saya</span>
        </Link>

        {/* Tab 5: Profil */}
        <Link
          href="/profil"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isProfileActive
              ? 'text-primary font-bold scale-105'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <User className={`w-5 h-5 ${isProfileActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[11px] mt-1">Profil</span>
        </Link>
      </div>
    </nav>
  );
}
