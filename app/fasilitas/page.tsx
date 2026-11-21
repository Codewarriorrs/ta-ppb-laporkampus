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
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <AppHeader title="Daftar Fasilitas Kampus" />

      {/* Search Input */}
      <div className="p-4 bg-white border-b border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari gedung, lab, ruang..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 focus:bg-white text-xs rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-gray-900 placeholder-gray-400 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
          <span>Gedung & Ruangan ({filteredFacilities.length})</span>
          <span>Ketuk untuk lihat laporan</span>
        </div>

        {loading && (
          <div className="space-y-3">
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
            <FacilityCardSkeleton />
          </div>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2 my-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs font-semibold text-red-800">{error}</p>
            <button
              onClick={fetchFacilities}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg"
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
          <div className="space-y-3">
            {filteredFacilities.map((facility) => (
              <Link
                key={facility.id}
                href={`/fasilitas/${facility.id}`}
                className="flex items-center bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all active:scale-[0.99] group gap-3.5"
              >
                {/* Foto / Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
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
                  <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {facility.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{facility.building}</span>
                  </div>

                  {/* Badge Jumlah Laporan */}
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    <FileText className="w-3 h-3" />
                    <span>{facility.report_count || 0} Laporan</span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
