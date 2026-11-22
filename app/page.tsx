'use client';

import React, { useState, useEffect } from 'react';
import { Report, CATEGORIES } from '@/types';
import ReportCard from '@/components/report/ReportCard';
import { ReportCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Search, ShieldAlert, RefreshCw, AlertCircle, Sparkles, Building2, LayoutDashboard, Plus } from 'lucide-react';
import Link from 'next/link';
import { getOfflineReports, offlineItemToReport } from '@/lib/offlineQueue';

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
        setError('Mode Offline: Memuat data dari cache lokal.');
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
    return () => window.removeEventListener('offline-reports-changed', handleQueueChange);
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports(searchQuery, selectedCategory);
  };

  const combinedReports = [...offlineReports, ...reports];

  return (
    <div className="flex-1 flex flex-col bg-neutral-50 pb-12">
      {/* ── MOBILE TOP HEADER (< md) ── */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-neutral-100 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-neutral-900 tracking-tight leading-tight">
                LaporKampus
              </h1>
              <p className="text-[10px] text-neutral-400 font-semibold">
                Sistem Sarana & Prasarana
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchReports(searchQuery, selectedCategory)}
              aria-label="Refresh Data"
              className="p-2 text-neutral-400 hover:text-primary hover:bg-neutral-50 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kerusakan atau fasilitas..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 focus:bg-white text-xs font-medium rounded-xl border border-neutral-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-neutral-900 placeholder-neutral-400 transition-all"
            />
          </div>
        </form>

        {/* Mobile Filter Kategori Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 -mx-4 px-4 no-scrollbar mt-1 border-t border-neutral-100">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'Semua'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-100'
            }`}
          >
            Semua
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* ── DESKTOP HERO & GREETING BANNER (Bergaya lms-nkgts) ── */}
      <div className="hidden md:block bg-white border-b border-neutral-100 py-8 px-6 mb-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Pusat Pelaporan Kampus
              </span>
              <span className="text-[10px] font-bold text-neutral-400">
                • Update Terkini
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              {getGreeting()}, Selamat Datang di LaporKampus
            </h2>
            <p className="text-xs text-neutral-500 max-w-xl">
              Laporkan kendala fasilitas di laboratorium, ruang kuliah, perpustakaan, hingga sanitasi kampus agar segera ditindaklanjuti oleh birokrasi sarpras.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/birokrasi"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl border border-neutral-200 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span>Dashboard Birokrasi</span>
            </Link>
            <Link
              href="/lapor"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Buat Laporan Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── DESKTOP FILTER BAR ── */}
      <div className="hidden md:block px-6 mb-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-neutral-100 p-4 shadow-xs flex items-center justify-between gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari laporan kerusakan, AC, proyektor, atau fasilitas..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </form>

          {/* Kategori Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('Semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'Semua'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-100'
              }`}
            >
              Semua
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (REPORT LIST) ── */}
      <div className="flex-1 p-4 md:px-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-500 font-bold px-1">
          <span>
            {selectedCategory === 'Semua'
              ? 'Laporan Terbaru Kampus'
              : `Laporan Kategori: ${selectedCategory}`}
            {' '}({combinedReports.length})
          </span>
          <button
            onClick={() => fetchReports(searchQuery, selectedCategory)}
            className="hidden md:flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
          </div>
        )}

        {/* Error State */}
        {!loading && error && combinedReports.length === 0 && (
          <div className="p-6 bg-danger/5 border border-danger/20 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-danger mx-auto" />
            <p className="text-xs font-bold text-danger">{error}</p>
            <button
              onClick={() => fetchReports(searchQuery, selectedCategory)}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && combinedReports.length === 0 && (
          <EmptyState
            title="Tidak Ada Laporan Ditemukan"
            description={
              searchQuery || selectedCategory !== 'Semua'
                ? 'Tidak ada laporan yang sesuai dengan kriteria filter atau pencarian Anda.'
                : 'Belum ada laporan kerusakan yang dikirimkan. Jadilah yang pertama melaporkan.'
            }
            actionLabel="Reset Pencarian"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
          />
        )}

        {/* List of Report Cards */}
        {!loading && combinedReports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {combinedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
