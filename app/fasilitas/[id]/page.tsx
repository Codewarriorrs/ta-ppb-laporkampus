'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Facility, Report } from '@/types';
import AppHeader from '@/components/layout/AppHeader';
import ReportCard from '@/components/report/ReportCard';
import { DetailSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Building2, MapPin, FileText, Plus, AlertCircle } from 'lucide-react';

interface FacilityDetailData extends Facility {
  reports: Report[];
}

export default function FacilityDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [facility, setFacility] = useState<FacilityDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetch(`/api/facilities/${id}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setFacility(res.data);
          } else {
            setError(res.message || 'Fasilitas tidak ditemukan');
          }
        })
        .catch(() => setError('Gagal memuat detail fasilitas'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="Detail Fasilitas" showBack={true} />

      <div className="flex-1 p-4 md:py-6">
        {loading && <DetailSkeleton />}

        {!loading && error && (
          <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-xs text-center max-w-md mx-auto my-6">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h2 className="text-base font-bold text-slate-900 mb-1">Gagal Memuat</h2>
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            <Link
              href="/fasilitas"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Kembali ke Daftar Fasilitas
            </Link>
          </div>
        )}

        {!loading && facility && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Kolom Kiri: Profil & Foto Fasilitas (5 Kolom di Desktop) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="w-full h-56 sm:h-72 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-xs relative">
                {facility.image_url ? (
                  <img
                    src={facility.image_url}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-500 bg-blue-50">
                    <Building2 className="w-16 h-16 stroke-[1.5]" />
                  </div>
                )}
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h1 className="text-lg font-bold text-slate-900">{facility.name}</h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">{facility.building}</span>
                </div>
                {facility.description && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                    {facility.description}
                  </p>
                )}

                <div className="pt-2">
                  <Link
                    href={`/lapor?facility_id=${facility.id}`}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Laporkan Kerusakan di Sini</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Daftar Laporan Terkait (7 Kolom di Desktop) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Laporan di Fasilitas Ini ({facility.reports?.length || 0})</span>
                </h2>
              </div>

              {facility.reports && facility.reports.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {facility.reports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Belum Ada Laporan"
                  description="Fasilitas ini belum memiliki catatan laporan kerusakan. Kondisinya terpantau baik!"
                  actionText="Buat Laporan Pertama"
                  actionHref={`/lapor?facility_id=${facility.id}`}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
