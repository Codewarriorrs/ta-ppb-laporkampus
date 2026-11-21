'use client';

import React from 'react';
import { WifiOff, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 min-h-screen">
      <div className="w-20 h-20 bg-blue-100/70 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
        <WifiOff className="w-10 h-10 stroke-[1.8]" />
      </div>

      <h1 className="text-xl font-black text-gray-900 mb-2">Koneksi Internet Terputus</h1>
      <p className="text-xs text-gray-500 max-w-xs mb-6 leading-relaxed">
        Anda sedang dalam mode luring (offline). Aplikasi LaporKampus menyimpan halaman ini di perangkat Anda melalui Service Worker.
      </p>

      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        <button
          onClick={() => window.location.reload()}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Muat Ulang Halaman</span>
        </button>

        <Link
          href="/"
          className="w-full py-2.5 bg-white hover:bg-gray-100 active:scale-95 text-gray-700 border border-gray-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
