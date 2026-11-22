'use client';

import React from 'react';
import { WifiOff, RotateCcw, Home, Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { AppLogoIcon } from '@/components/ui/AppLogo';

export default function OfflinePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background min-h-screen">
      <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-card-3d border border-white/80 flex flex-col items-center">
        {/* Soft 3D Ambient Icon */}
        <div className="w-20 h-20 bg-surface-strong text-primary rounded-[24px] flex items-center justify-center mb-5 shadow-soft-3d border border-primary/10">
          <WifiOff className="w-9 h-9 stroke-[2.2] animate-pulse" />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mb-2 font-display">
          Anda Sedang Offline
        </h1>
        <p className="text-xs text-neutral-500 max-w-sm mb-6 leading-relaxed font-sans">
          Jangan khawatir! Anda tetap dapat mencatat dan membuat laporan kerusakan fasilitas kampus. Laporan akan tersimpan aman di perangkat Anda dan otomatis terunggah saat terhubung kembali.
        </p>

        <div className="flex flex-col gap-2.5 w-full">
          <Link
            href="/lapor"
            className="w-full py-3 px-4 bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs font-bold rounded-[18px] shadow-btn-3d flex items-center justify-center gap-2 transition-all font-sans"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Laporan Baru (Mode Offline)</span>
          </Link>

          <Link
            href="/laporan-saya"
            className="w-full py-3 px-4 bg-surface-strong hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-[18px] border border-neutral-200/60 flex items-center justify-center gap-2 transition-all font-sans"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span>Lihat Antrean Laporan Offline</span>
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 text-neutral-500 hover:text-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors font-sans mt-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Muat Ulang Halaman</span>
          </button>
        </div>
      </div>
    </div>
  );
}
