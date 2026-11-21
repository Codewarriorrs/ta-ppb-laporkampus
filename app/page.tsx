'use client';

import React, { useState, useEffect } from 'react';
import { Report, CATEGORIES, Category } from '@/types';
import ReportCard from '@/components/report/ReportCard';
import { ReportCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Search, ShieldAlert, SlidersHorizontal, RefreshCw, AlertCircle } from 'lucide-react';

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
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-900 tracking-tight leading-tight">
                LaporKampus
              </h1>
              <p className="text-[10px] text-gray-500 font-medium">
                Pusat Pelaporan Sarana Kampus
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchReports(searchQuery, selectedCategory)}
            aria-label="Refresh Data"
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors active:rotate-180"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kerusakan atau fasilitas..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 hover:bg-gray-100/80 focus:bg-white text-xs rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-gray-900 placeholder-gray-400 transition-all"
            />
          </div>
        </form>

        {/* Filter Kategori Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 -mx-4 px-4 no-scrollbar mt-1">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCategory === 'Semua'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Semua
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-4 space-y-3">
        {/* Banner Quick Info */}
        <div className="p-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Ada Sarana Rusak?
            </h2>
            <p className="text-sm font-semibold mt-0.5">Laporkan segera untuk kampus yang lebih baik</p>
          </div>
        </div>

        {/* Status Section Title */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Laporan Terbaru ({reports.length})
          </h2>
          {selectedCategory !== 'Semua' && (
            <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
              Kategori: {selectedCategory}
            </span>
          )}
        </div>

        {/* State Loading */}
        {loading && (
          <div className="space-y-3">
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
          </div>
        )}

        {/* State Error */}
        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2 my-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs font-semibold text-red-800">{error}</p>
            <button
              onClick={() => fetchReports(searchQuery, selectedCategory)}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg shadow-sm hover:bg-red-700 active:scale-95 transition-all"
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
                : 'Belum ada laporan kerusakan fasilitas saat ini. Jadilah yang pertama melaporkan!'
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

        {/* List Laporan */}
        {!loading && !error && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
