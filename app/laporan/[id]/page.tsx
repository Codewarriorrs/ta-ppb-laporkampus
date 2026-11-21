'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Report } from '@/types';
import AppHeader from '@/components/layout/AppHeader';
import CategoryBadge from '@/components/report/CategoryBadge';
import DynamicMap from '@/components/map/DynamicMap';
import { DetailSkeleton } from '@/components/ui/Skeleton';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  User, 
  Edit3, 
  Trash2, 
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // 1. Ambil info user yang sedang login
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setCurrentUserId(res.data.id);
        }
      })
      .catch(() => {});

    // 2. Ambil detail laporan
    if (id) {
      fetch(`/api/reports/${id}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setReport(res.data);
          } else {
            setError(res.message || 'Laporan tidak ditemukan');
          }
        })
        .catch(() => {
          setError('Gagal memuat detail laporan');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/');
        router.refresh();
      } else {
        alert(data.message || 'Gagal menghapus laporan');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus laporan');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const isOwner = currentUserId && report && report.user_id === currentUserId;

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Detail Laporan Fasilitas"
        showBack={true}
        rightAction={
          isOwner ? (
            <div className="flex items-center gap-1.5">
              <Link
                href={`/laporan/${id}/edit`}
                className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors border border-blue-200"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors border border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            </div>
          ) : undefined
        }
      />

      <div className="flex-1 p-4 md:py-6">
        {loading && <DetailSkeleton />}

        {!loading && error && (
          <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-xs text-center max-w-md mx-auto my-6">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h2 className="text-base font-bold text-slate-900 mb-1">Laporan Tidak Ditemukan</h2>
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Kembali ke Beranda
            </Link>
          </div>
        )}

        {!loading && report && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Kolom Kiri: Foto & Deskripsi (7 Kolom di Desktop) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Foto Besar */}
              <div className="w-full h-64 sm:h-80 md:h-96 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-xs relative">
                {report.photo_url ? (
                  <img
                    src={report.photo_url}
                    alt={report.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                    <Building2 className="w-12 h-12 stroke-[1.2] mb-1" />
                    <span className="text-xs">Foto bukti fisik tidak dilampirkan</span>
                  </div>
                )}
              </div>

              {/* Deskripsi Kerusakan */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Deskripsi Kerusakan
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {report.description}
                </p>
              </div>
            </div>

            {/* Kolom Kanan: Metadata & Peta Leaflet (5 Kolom di Desktop) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Informasi Utama */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge category={report.category} size="md" />
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h1 className="text-lg font-bold text-slate-900 leading-snug">
                  {report.title}
                </h1>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>
                      Fasilitas:{' '}
                      <strong className="text-slate-900 font-semibold">
                        {report.facility_name}
                      </strong>
                      {report.facility_building ? ` (${report.facility_building})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span>
                      Pelapor:{' '}
                      <strong className="text-slate-900 font-semibold">
                        {report.user_name || 'Mahasiswa'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Peta Lokasi Leaflet */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Titik Lokasi di Kampus
                    </h3>
                  </div>
                  {report.latitude && report.longitude && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)}
                    </span>
                  )}
                </div>

                {report.latitude && report.longitude ? (
                  <DynamicMap
                    latitude={Number(report.latitude)}
                    longitude={Number(report.longitude)}
                    markerTitle={`${report.facility_name}: ${report.title}`}
                    height="200px"
                    interactive={false}
                  />
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-400">
                    Koordinat peta tidak disematkan pada laporan ini.
                  </div>
                )}
              </div>

              {/* Aksi Khusus Pemilik */}
              {isOwner && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <p className="text-xs text-slate-500 font-medium">
                    Anda adalah pemilik laporan ini:
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/laporan/${id}/edit`}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Laporan</span>
                    </Link>

                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Laporan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-3 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Konfirmasi Hapus Laporan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Hapus Laporan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
