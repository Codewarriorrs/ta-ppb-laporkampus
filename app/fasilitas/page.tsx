'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facility } from '@/types';
import AppHeader from '@/components/layout/AppHeader';
import { FacilityCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Building2, MapPin, FileText, Search, ChevronRight, AlertCircle } from 'lucide-react';

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
      setError(err.message || 'Terjadi kesalahan');
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
    <div className="flex-1 flex flex-col">
      <AppHeader title="Daftar Fasilitas Kampus" />

      {/* Search Input */}
      <div className="p-4 md:py-5 bg-white border-b border-slate-200">
        <div className="max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari gedung, laboratorium, ruang kelas..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:py-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Gedung & Ruangan ({filteredFacilities.length})</span>
          <span>Pilih untuk melihat detail laporan</span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
          </div>
        )}

        {!loading && error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs font-semibold text-red-800">{error}</p>
            <button
              onClick={fetchFacilities}
              className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && filteredFacilities.length === 0 && (
          <EmptyState
            icon={Building2}
            title="Fasilitas Tidak Ditemukan"
            description={
              searchQuery
                ? 'Tidak ada fasilitas atau gedung yang sesuai dengan pencarian Anda.'
                : 'Belum ada data fasilitas yang tersimpan di sistem.'
            }
          />
        )}

        {!loading && !error && filteredFacilities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFacilities.map((facility) => (
              <Link
                key={facility.id}
                href={`/fasilitas/${facility.id}`}
                className="flex items-center bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.99] group gap-3.5"
              >
                {/* Foto / Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                  {facility.image_url ? (
                    <img
                      src={facility.image_url}
                      alt={facility.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-500 bg-blue-50">
                      <Building2 className="w-7 h-7 stroke-[1.8]" />
                    </div>
                  )}
                </div>

                {/* Info Fasilitas */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {facility.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{facility.building}</span>
                  </div>

                  {/* Badge Jumlah Laporan */}
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>{facility.report_count || 0} Laporan</span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
