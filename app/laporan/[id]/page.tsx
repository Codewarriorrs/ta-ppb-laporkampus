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
  Share2, 
  AlertCircle,
  Loader2
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
        .catch((err) => {
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
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <AppHeader
        title="Detail Laporan"
        showBack={true}
        rightAction={
          isOwner ? (
            <div className="flex items-center gap-1">
              <Link
                href={`/laporan/${id}/edit`}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Laporan"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus Laporan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : undefined
        }
      />

      <div className="flex-1 p-4 space-y-4">
        {loading && <DetailSkeleton />}

        {!loading && error && (
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center my-6">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h2 className="text-base font-bold text-gray-900 mb-1">Laporan Tidak Ditemukan</h2>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Kembali ke Beranda
            </Link>
          </div>
        )}

        {!loading && report && (
          <div className="space-y-4">
            {/* Foto Besar */}
            <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs relative">
              {report.photo_url ? (
                <img
                  src={report.photo_url}
                  alt={report.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                  <Building2 className="w-12 h-12 stroke-[1.2] mb-1" />
                  <span className="text-xs">Tidak ada foto bukti</span>
                </div>
              )}
            </div>

            {/* Informasi Utama */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <CategoryBadge category={report.category} size="md" />
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(report.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <h1 className="text-lg font-bold text-gray-900 leading-snug">
                {report.title}
              </h1>

              {/* Fasilitas & Pelapor Info */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-1 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Fasilitas:{' '}
                    <strong className="text-gray-900 font-semibold">
                      {report.facility_name}
                    </strong>
                    {report.facility_building ? ` (${report.facility_building})` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Pelapor:{' '}
                    <strong className="text-gray-900 font-semibold">
                      {report.user_name || 'Mahasiswa'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Deskripsi Kerusakan */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Deskripsi Kerusakan
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {report.description}
              </p>
            </div>

            {/* Lokasi di Peta Leaflet */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Lokasi di Lingkungan Kampus
                  </h3>
                </div>
                {report.latitude && report.longitude && (
                  <span className="text-[10px] text-gray-400 font-mono">
                    {Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)}
                  </span>
                )}
              </div>

              {report.latitude && report.longitude ? (
                <DynamicMap
                  latitude={Number(report.latitude)}
                  longitude={Number(report.longitude)}
                  markerTitle={`${report.facility_name}: ${report.title}`}
                  height="180px"
                  interactive={false}
                />
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-400">
                  Koordinat peta tidak disematkan pada laporan ini.
                </div>
              )}
            </div>

            {/* Aksi Pemilik (Jika belum di header) */}
            {isOwner && (
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href={`/laporan/${id}/edit`}
                  className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-blue-200"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Laporan</span>
                </Link>

                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Laporan</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 space-y-3 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Hapus Laporan?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
