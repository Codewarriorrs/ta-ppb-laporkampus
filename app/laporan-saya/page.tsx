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
  Plus
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
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Laporan Saya"
        rightAction={
          <Link
            href="/lapor"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Lapor Baru</span>
          </Link>
        }
      />

      <div className="flex-1 p-4 md:py-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Riwayat Pelaporan Mandiri ({reports.length})</span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
          </div>
        )}

        {!loading && error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs font-semibold text-red-800">{error}</p>
            <button
              onClick={fetchMyReports}
              className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Belum Ada Laporan"
            description="Anda belum pernah membuat laporan fasilitas. Laporkan kerusakan sarana kampus yang Anda temui."
            actionText="Buat Laporan Baru"
            actionHref="/lapor"
          />
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {/* Thumbnail Foto */}
                    <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      {report.photo_url ? (
                        <img
                          src={report.photo_url}
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 text-[10px]">
                          Tanpa Foto
                        </div>
                      )}
                    </div>

                    {/* Info Ringkas */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <CategoryBadge category={report.category} />
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatTimeAgo(report.created_at)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-xs line-clamp-2 leading-snug">
                          {report.title}
                        </h3>
                      </div>

                      <div className="flex items-center text-[11px] text-slate-500 gap-1 truncate">
                        <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{report.facility_name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/laporan/${report.id}`}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/laporan/${report.id}/edit`}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 px-2.5 border border-blue-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => setDeleteTargetId(report.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 px-2.5 border border-red-200"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-3 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Konfirmasi Hapus Laporan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Laporan ini akan dihapus secara permanen dari basis data kampus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
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
