'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facility } from '@/types';
import AppHeader from '@/components/layout/AppHeader';
import { FacilityCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Building2, MapPin, FileText, Search, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFacilities = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/facilities');
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat data fasilitas');
      }

      setFacilities(data.data || []);
    } catch (err: any) {
      if (!navigator.onLine) {
        setError('Mode Offline: Menampilkan data fasilitas tersimpan.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat memuat fasilitas.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-neutral-50 pb-12">
      <AppHeader title="Daftar Fasilitas Kampus" showBack backHref="/" />

      {/* Search Input */}
      <div className="p-4 md:py-5 bg-white border-b border-neutral-100 shadow-xs">
        <div className="max-w-md mx-auto sm:mx-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari gedung, lab komputer, ruang kuliah..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 focus:bg-white text-xs font-medium rounded-xl border border-neutral-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-neutral-900 placeholder-neutral-400 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:py-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-500 font-bold px-1">
          <span>Gedung & Ruangan Kampus ({filteredFacilities.length})</span>
          <span className="hidden sm:inline text-neutral-400 font-medium">Klik untuk melihat riwayat kerusakan</span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
          </div>
        )}

        {!loading && error && filteredFacilities.length === 0 && (
          <div className="p-6 bg-danger/5 border border-danger/20 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-danger mx-auto" />
            <p className="text-xs font-bold text-danger">{error}</p>
            <button
              onClick={fetchFacilities}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && filteredFacilities.length === 0 && (
          <EmptyState
            icon={Building2}
            title="Fasilitas Tidak Ditemukan"
            description="Tidak ada fasilitas atau gedung yang sesuai dengan kata kunci pencarian Anda."
            actionLabel="Reset Pencarian"
            onAction={() => setSearchQuery('')}
          />
        )}

        {!loading && filteredFacilities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFacilities.map((facility) => (
              <Link
                key={facility.id}
                href={`/fasilitas/${facility.id}`}
                className="block bg-surface rounded-[24px] border border-white/80 ring-1 ring-neutral-200/60 shadow-card-3d hover:shadow-soft-3d hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.99] overflow-hidden group"
              >
                {/* Gambar Fasilitas */}
                <div className="w-full h-40 bg-neutral-100 relative overflow-hidden">
                  {facility.image_url ? (
                    <img
                      src={facility.image_url}
                      alt={facility.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-50">
                      <Building2 className="w-8 h-8 stroke-[1.5]" />
                    </div>
                  )}

                  {/* Badge Jumlah Laporan */}
                  <div className="absolute top-3 right-3 bg-neutral-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                    <FileText className="w-3 h-3 text-accent" />
                    <span>{facility.report_count || 0} Laporan</span>
                  </div>
                </div>

                {/* Konten Card */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center text-[11px] text-neutral-400 font-bold gap-1 uppercase tracking-wider font-sans">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{facility.building}</span>
                  </div>

                  <h3 className="font-extrabold text-neutral-900 text-sm line-clamp-1 group-hover:text-primary transition-colors font-display">
                    {facility.name}
                  </h3>

                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-sans">
                    {facility.description || 'Fasilitas aktif lingkungan kampus.'}
                  </p>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-primary font-bold">
                    <span>Lihat Riwayat Laporan</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
