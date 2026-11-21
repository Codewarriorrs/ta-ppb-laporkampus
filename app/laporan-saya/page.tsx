'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Report } from '@/types';
import AppHeader from '@/components/layout/AppHeader';
import CategoryBadge from '@/components/report/CategoryBadge';
import { ReportCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { formatTimeAgo } from '@/components/report/ReportCard';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  PlusCircle
} from 'lucide-react';

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyReports = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reports/mine');
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat laporan Anda');
      }

      setReports(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/reports/${deleteTargetId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setReports(reports.filter((r) => r.id !== deleteTargetId));
        setDeleteTargetId(null);
      } else {
        alert(data.message || 'Gagal menghapus laporan');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus laporan');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <AppHeader
        title="Laporan Saya"
        rightAction={
          <Link
            href="/lapor"
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Baru</span>
          </Link>
        }
      />

      <div className="flex-1 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
          <span>Riwayat Pelaporan Anda ({reports.length})</span>
        </div>

        {loading && (
          <div className="space-y-3">
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
          </div>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2 my-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs font-semibold text-red-800">{error}</p>
            <button
              onClick={fetchMyReports}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Belum Ada Laporan"
            description="Anda belum pernah membuat laporan fasilitas. Buat laporan sekarang jika menemukan kerusakan sarana kampus."
            actionText="Buat Laporan Baru"
            actionHref="/lapor"
          />
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3.5 space-y-3"
              >
                <div className="flex gap-3">
                  {/* Thumbnail Foto */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                    {report.photo_url ? (
                      <img
                        src={report.photo_url}
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-[10px]">
                        Tanpa Foto
                      </div>
                    )}
                  </div>

                  {/* Info Ringkas */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <CategoryBadge category={report.category} />
                        <span className="text-[10px] text-gray-400">
                          {formatTimeAgo(report.created_at)}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-xs line-clamp-2">
                        {report.title}
                      </h3>
                    </div>

                    <div className="flex items-center text-[11px] text-gray-500 gap-1 truncate">
                      <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{report.facility_name}</span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/laporan/${report.id}`}
                    className="flex-1 py-1.5 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/laporan/${report.id}/edit`}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 px-2.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => setDeleteTargetId(report.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 px-2.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 space-y-3 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Hapus Laporan Ini?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Laporan akan dihapus permanen dari sistem dan tidak dapat dipulihkan.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
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
