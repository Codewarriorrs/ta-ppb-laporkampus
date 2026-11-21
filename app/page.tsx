'use client';

import React, { useState, useEffect } from 'react';
import { Report, CATEGORIES } from '@/types';
import ReportCard from '@/components/report/ReportCard';
import { ReportCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Search, ShieldAlert, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const fetchReports = async (query = '', cat = 'Semua') => {
    setLoading(true);
    setError('');

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
      setError(err.message || 'Terjadi kesalahan saat memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(searchQuery, selectedCategory);
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports(searchQuery, selectedCategory);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Mobile Top Header (hanya muncul di HP < md) */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                LaporKampus
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">
                Pusat Pelaporan Sarana Kampus
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchReports(searchQuery, selectedCategory)}
            aria-label="Refresh Data"
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kerusakan atau fasilitas..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 focus:bg-white text-xs rounded-lg border border-transparent focus:border-blue-500 focus:outline-none text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>
        </form>

        {/* Mobile Filter Kategori Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 -mx-4 px-4 no-scrollbar mt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              selectedCategory === 'Semua'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:py-6 space-y-4">
        {/* Desktop Hero Banner & Search (muncul di layar tablet & laptop) */}
        <div className="hidden md:block bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Layanan Terpadu Fasilitas
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                Daftar Pelaporan Sarana Kampus
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Pantau sarana dan prasarana yang sedang dilaporkan oleh sivitas akademika
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/lapor"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                + Buat Laporan Baru
              </Link>
            </div>
          </div>

          {/* Desktop Search & Filters */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center gap-3 justify-between">
            <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kerusakan atau lokasi gedung..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
            </form>

            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('Semua')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'Semua'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                Semua
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Counter */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Laporan Terkini ({reports.length})
          </h3>
          {selectedCategory !== 'Semua' && (
            <span className="text-xs text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Kategori: {selectedCategory}
            </span>
          )}
        </div>

        {/* State Loading */}
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

        {/* State Error */}
        {!loading && error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs font-semibold text-red-800">{error}</p>
            <button
              onClick={() => fetchReports(searchQuery, selectedCategory)}
              className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* State Kosong */}
        {!loading && !error && reports.length === 0 && (
          <EmptyState
            title="Belum Ada Laporan"
            description={
              searchQuery || selectedCategory !== 'Semua'
                ? 'Tidak ditemukan laporan yang sesuai dengan pencarian atau filter yang Anda pilih.'
                : 'Belum ada laporan kerusakan fasilitas saat ini.'
            }
            actionText={searchQuery || selectedCategory !== 'Semua' ? 'Reset Filter' : 'Buat Laporan Baru'}
            actionHref={searchQuery || selectedCategory !== 'Semua' ? undefined : '/lapor'}
            onAction={
              searchQuery || selectedCategory !== 'Semua'
                ? () => {
                    setSearchQuery('');
                    setSelectedCategory('Semua');
                    fetchReports('', 'Semua');
                  }
                : undefined
            }
          />
        )}

        {/* List Grid Laporan (Responsive 1 kolom di HP, 2-3 kolom di Desktop) */}
        {!loading && !error && reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
