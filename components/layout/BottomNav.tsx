'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Plus, FileText, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Jangan tampilkan bottom nav di halaman login dan register
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isFacilitiesActive = pathname.startsWith('/fasilitas');
  const isReportActive = pathname === '/lapor';
  const isMyReportsActive = pathname === '/laporan-saya';
  const isProfileActive = pathname === '/profil';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-transparent pointer-events-none">
      <div className="w-full max-w-[480px] bg-white border-t border-gray-200 shadow-lg pointer-events-auto flex items-center justify-around px-2 py-1.5 pb-safe">
        {/* Tab 1: Beranda */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isHomeActive ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[11px] mt-0.5">Beranda</span>
        </Link>

        {/* Tab 2: Fasilitas */}
        <Link
          href="/fasilitas"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isFacilitiesActive ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Building2 className={`w-5 h-5 ${isFacilitiesActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[11px] mt-0.5">Fasilitas</span>
        </Link>

        {/* Tab 3: Lapor (Tombol Tengah Menonjol) */}
        <Link
          href="/lapor"
          className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
              isReportActive
                ? 'bg-blue-700 ring-4 ring-blue-100 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-8 h-8 stroke-[2.5px]" />
          </div>
          <span
            className={`text-[11px] mt-0.5 font-semibold ${
              isReportActive ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Lapor
          </span>
        </Link>

        {/* Tab 4: Laporan Saya */}
        <Link
          href="/laporan-saya"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isMyReportsActive ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className={`w-5 h-5 ${isMyReportsActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[11px] mt-0.5">Laporan Saya</span>
        </Link>

        {/* Tab 5: Profil */}
        <Link
          href="/profil"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isProfileActive ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <User className={`w-5 h-5 ${isProfileActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
          <span className="text-[11px] mt-0.5">Profil</span>
        </Link>
      </div>
    </nav>
  );
}
