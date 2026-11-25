'use client';

import React, { useState, useEffect } from 'react';
import { Report, CATEGORIES } from '@/types';
import ReportCard from '@/components/report/ReportCard';
import { ReportCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Search, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { getOfflineReports, offlineItemToReport } from '@/lib/offlineQueue';
import AppLogo, { AppLogoIcon } from '@/components/ui/AppLogo';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [offlineReports, setOfflineReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const fetchReports = async (query = '', cat = 'Semua') => {
    setLoading(true);
    setError('');

    // Muat juga antrean offline dari perangkat jika ada
    const offlineItems = getOfflineReports().map(offlineItemToReport);
    setOfflineReports(offlineItems);

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (cat !== 'Semua') params.append('category', cat);

      const res = await fetch(`/api/reports?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal memuat data laporan');
      }

      setReports(json.data || []);
    } catch (err: any) {
      if (!navigator.onLine) {
        setError('Mode Offline: Memuat data dari cache lokal perangkat.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat memuat laporan');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(searchQuery, selectedCategory);

    const handleQueueChange = () => {
      setOfflineReports(getOfflineReports().map(offlineItemToReport));
    };
    window.addEventListener('offline-reports-changed', handleQueueChange);

    const handleOnline = async () => {
      console.log('Koneksi internet kembali! Memulai sinkronisasi otomatis...');
      const { syncOfflineReports } = await import('@/lib/offlineQueue');
      const res = await syncOfflineReports();
      if (res.synced > 0) {
        fetchReports(searchQuery, selectedCategory);
      }
    };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline-reports-changed', handleQueueChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports(searchQuery, selectedCategory);
  };

  const combinedReports = [...offlineReports, ...reports];

  return (
    <div className="flex-1 flex flex-col bg-background pb-16 min-h-screen">
      {/* ── MOBILE TOP HEADER (< md) ── */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/70 px-4 py-3 shadow-soft-3d">
        <div className="flex items-center justify-between">
          <AppLogo size="sm" withSubtitle={false} />

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchReports(searchQuery, selectedCategory)}
              aria-label="Refresh Data"
              className="p-2 text-neutral-400 hover:text-primary hover:bg-neutral-100 rounded-[12px] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kerusakan atau fasilitas..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 focus:bg-white text-xs font-semibold rounded-[16px] border border-neutral-200/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-neutral-900 placeholder-neutral-400 transition-all font-sans"
            />
          </div>
        </form>

        {/* Mobile Filter Kategori Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 -mx-4 px-4 no-scrollbar mt-1 border-t border-neutral-100">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-[14px] text-xs font-bold transition-all ${
              selectedCategory === 'Semua'
                ? 'bg-primary text-white shadow-btn-3d'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60'
            }`}
          >
            Semua
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-[14px] text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-btn-3d'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* ── DESKTOP HERO & GREETING BANNER (Soft 3D Illustration) ── */}
      <div className="hidden md:block px-6 pt-8 pb-4">
        <div className="max-w-6xl mx-auto bg-white rounded-[32px] p-8 shadow-card-3d border border-white/80 flex items-center justify-between gap-8 relative overflow-hidden">
          {/* Ambient Soft Glow Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-100/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-accent-light/40 rounded-full blur-3xl pointer-events-none -mb-20" />

          <div className="space-y-3 relative z-10 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary">
                Pusat Pelaporan Kampus
              </span>
              <span className="text-xs font-medium text-neutral-400 font-sans">
                • Pantau & Jaga Sarpras Bersama
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight font-display leading-tight">
              {getGreeting()}, Selamat Datang di LaporKampus
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-sans leading-relaxed">
              Laporkan kendala fasilitas di ruang kuliah, lab komputer, perpustakaan, hingga sanitasi kampus agar lekas ditindaklanjuti oleh pihak birokrasi sarpras.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10">
            <Link
              href="/lapor"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-[18px] shadow-btn-3d transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Buat Laporan Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── DESKTOP FILTER BAR ── */}
      <div className="hidden md:block px-6 mb-6">
        <div className="max-w-6xl mx-auto bg-white rounded-[24px] border border-white/80 p-4 shadow-soft-3d flex items-center justify-between gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kerusakan, proyektor, AC, atau fasilitas..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200/80 rounded-[16px] text-xs font-semibold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
          </form>

          {/* Kategori Filters Soft 3D Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('Semua')}
              className={`px-4 py-2 rounded-[16px] text-xs font-bold transition-all ${
                selectedCategory === 'Semua'
                  ? 'bg-primary text-white shadow-btn-3d font-extrabold'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-white hover:text-neutral-900 border border-neutral-200/60'
              }`}
            >
              Semua
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-[16px] text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-btn-3d font-extrabold'
                    : 'bg-neutral-50 text-neutral-600 hover:bg-white hover:text-neutral-900 border border-neutral-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (REPORT LIST) ── */}
      <div className="flex-1 px-4 md:px-6 max-w-6xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-500 font-bold px-1 font-sans">
          <span>
            {selectedCategory === 'Semua'
              ? 'Laporan Terbaru Kampus'
              : `Laporan Kategori: ${selectedCategory}`}
            {' '}({combinedReports.length})
          </span>
          <button
            onClick={() => fetchReports(searchQuery, selectedCategory)}
            className="hidden md:flex items-center gap-1.5 text-xs text-primary hover:underline font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan Data</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ReportCardSkeleton key={n} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 bg-danger-light border border-danger/20 rounded-[20px] text-danger text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => fetchReports(searchQuery, selectedCategory)}
              className="text-xs font-bold underline hover:no-underline shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && combinedReports.length === 0 && (
          <EmptyState
            title="Belum Ada Laporan"
            description="Tidak ada laporan fasilitas kampus yang sesuai dengan pencarian atau filter Anda."
            actionText="Buat Laporan Baru"
            actionHref="/lapor"
          />
        )}

        {/* Report Grid Cards */}
        {!loading && combinedReports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combinedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
