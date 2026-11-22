'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Report } from '@/types';
import AppHeader from '@/components/layout/AppHeader';
import CategoryBadge from '@/components/report/CategoryBadge';
import StatusBadge from '@/components/report/StatusBadge';
import { ReportCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { formatTimeAgo } from '@/components/report/ReportCard';
import { getOfflineReports, offlineItemToReport, syncOfflineReports, removeOfflineReport } from '@/lib/offlineQueue';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  CloudOff,
  MessageSquare
} from 'lucide-react';

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [offlineReports, setOfflineReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchMyReports = async () => {
    setLoading(true);
    setError('');

    // Load offline queued reports
    const localPending = getOfflineReports().map(offlineItemToReport);
    setOfflineReports(localPending);

    try {
      const res = await fetch('/api/reports/mine');
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat laporan Anda');
      }

      setReports(data.data || []);
    } catch (err: any) {
      if (!navigator.onLine) {
        setError('Anda sedang offline. Menampilkan antrean laporan di perangkat.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat memuat laporan.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();

    const handleQueueChange = () => {
      setOfflineReports(getOfflineReports().map(offlineItemToReport));
    };
    window.addEventListener('offline-reports-changed', handleQueueChange);

    const handleOnline = async () => {
      console.log('Koneksi internet kembali! Memulai sinkronisasi otomatis...');
      const res = await syncOfflineReports();
      if (res.synced > 0) {
        fetchMyReports();
      }
    };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline-reports-changed', handleQueueChange);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleManualSync = async () => {
    if (!navigator.onLine) {
      alert('Koneksi internet belum tersedia untuk melakukan sinkronisasi.');
      return;
    }
    setSyncing(true);
    const res = await syncOfflineReports();
    setSyncing(false);

    if (res.synced > 0) {
      alert(`Berhasil mengunggah ${res.synced} laporan offline ke server!`);
    } else if (res.failed > 0) {
      alert(`Gagal mengunggah laporan: ${res.message || 'Periksa koneksi atau sesi login Anda.'}`);
    }

    fetchMyReports();
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    // Jika delete target adalah offline report
    if (deleteTargetId.startsWith('offline-')) {
      removeOfflineReport(deleteTargetId);
      setOfflineReports((prev) => prev.filter((r) => r.id !== deleteTargetId));
      setDeleteTargetId(null);
      return;
    }

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

  const allReports = [...offlineReports, ...reports];

  return (
    <div className="flex-1 flex flex-col bg-neutral-50 pb-12">
      <AppHeader
        title="Laporan Saya"
        showBack
        backHref="/"
        rightAction={
          <Link
            href="/lapor"
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Lapor Baru</span>
          </Link>
        }
      />

      <div className="flex-1 p-4 md:py-6 space-y-4">
        {/* Antrean Offline Alert jika ada */}
        {offlineReports.length > 0 && (
          <div className="p-4 bg-neutral-900 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <CloudOff className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold">Ada {offlineReports.length} Laporan Tersimpan Offline</p>
                <p className="text-[11px] text-neutral-400">Tersimpan di memori HP. Otomatis terunggah saat online.</p>
              </div>
            </div>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-dark text-neutral-900 font-extrabold text-xs rounded-xl transition-colors disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sinkron...' : 'Unggah'}</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-neutral-500 font-bold px-1">
          <span>Riwayat Pelaporan Mandiri ({allReports.length})</span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <ReportCardSkeleton />
            <ReportCardSkeleton />
            <ReportCardSkeleton />
          </div>
        )}

        {!loading && error && allReports.length === 0 && (
          <div className="p-6 bg-danger/5 border border-danger/20 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-danger mx-auto" />
            <p className="text-xs font-bold text-danger">{error}</p>
            <button
              onClick={fetchMyReports}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && allReports.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Belum Ada Laporan"
            description="Anda belum pernah membuat laporan fasilitas. Laporkan kerusakan sarana kampus yang Anda temui."
            actionText="Buat Laporan Baru"
            actionHref="/lapor"
          />
        )}

        {!loading && allReports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {allReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-4 flex flex-col justify-between hover:border-neutral-200 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex gap-3.5">
                    {/* Thumbnail Foto */}
                    <div className="w-20 h-20 rounded-xl bg-neutral-50 overflow-hidden shrink-0 border border-neutral-100">
                      {report.photo_url ? (
                        <img
                          src={report.photo_url}
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-50 text-[10px] font-bold">
                          Tanpa Foto
                        </div>
                      )}
                    </div>

                    {/* Info Ringkas */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <CategoryBadge category={report.category} />
                            <StatusBadge status={report.status} isOffline={report.is_offline} />
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {formatTimeAgo(report.created_at)}
                          </span>
                        </div>
                        <h3 className="font-bold text-neutral-900 text-xs line-clamp-2 leading-snug">
                          {report.title}
                        </h3>
                      </div>

                      <div className="flex items-center text-[11px] text-neutral-500 font-medium gap-1 truncate pt-1">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{report.facility_name}</span>
                      </div>
                    </div>
                  </div>

                  {report.feedback && (
                    <div className="p-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-xs space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                        <MessageSquare className="w-3 h-3" />
                        <span>Tanggapan Birokrasi ({report.feedback_by_name || 'Sarpras'}):</span>
                      </div>
                      <p className="text-neutral-700 italic text-[11px]">&ldquo;{report.feedback}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi */}
                <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  {!report.is_offline ? (
                    <>
                      <Link
                        href={`/laporan/${report.id}`}
                        className="flex-1 py-2 px-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1 border border-neutral-100"
                      >
                        <span>Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/laporan/${report.id}/edit`}
                        className="py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors flex items-center gap-1 border border-primary/20"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    </>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-bold flex-1 py-1">
                      Menunggu tersambung internet...
                    </span>
                  )}

                  <button
                    onClick={() => setDeleteTargetId(report.id)}
                    className="py-2 px-3 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-bold rounded-xl transition-colors flex items-center gap-1 border border-danger/20"
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
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-3 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-extrabold text-neutral-900">Konfirmasi Hapus Laporan</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Laporan ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-danger hover:bg-danger-dark text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-md shadow-danger/20"
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
