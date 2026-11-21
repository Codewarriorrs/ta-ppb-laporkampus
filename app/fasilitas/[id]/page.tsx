'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Facility, Report } from '@/types';
import AppHeader from '@/components/layout/AppHeader';
import ReportCard from '@/components/report/ReportCard';
import { DetailSkeleton, ReportCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Building2, MapPin, FileText, PlusCircle, AlertCircle } from 'lucide-react';

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
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <AppHeader title="Detail Fasilitas" showBack={true} />

      <div className="flex-1 p-4 space-y-4">
        {loading && <DetailSkeleton />}

        {!loading && error && (
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center my-6">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h2 className="text-base font-bold text-gray-900 mb-1">Gagal Memuat</h2>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <Link
              href="/fasilitas"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Kembali ke Daftar Fasilitas
            </Link>
          </div>
        )}

        {!loading && facility && (
          <div className="space-y-4">
            {/* Foto Fasilitas */}
            <div className="w-full h-52 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-xs relative">
              {facility.image_url ? (
                <img
                  src={facility.image_url}
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-400 bg-blue-50">
                  <Building2 className="w-14 h-14" />
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <h1 className="text-lg font-bold text-gray-900">{facility.name}</h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium">{facility.building}</span>
              </div>
              {facility.description && (
                <p className="text-xs text-gray-500 leading-relaxed pt-2 border-t border-gray-100">
                  {facility.description}
                </p>
              )}

              {/* Action Buat Laporan Cepat */}
              <div className="pt-2">
                <Link
                  href={`/lapor?facility_id=${facility.id}`}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Laporkan Kerusakan di Sini</span>
                </Link>
              </div>
            </div>

            {/* Daftar Laporan Terkait */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Laporan di Fasilitas Ini ({facility.reports?.length || 0})</span>
                </h2>
              </div>

              {facility.reports && facility.reports.length > 0 ? (
                <div className="space-y-3">
                  {facility.reports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Belum Ada Laporan"
                  description="Fasilitas ini belum memiliki laporan kerusakan. Kondisinya terpantau baik!"
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
