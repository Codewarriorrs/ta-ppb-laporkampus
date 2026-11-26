'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Report, ReportStatus, ReportPriority, REPORT_PRIORITIES, isReportOverdue } from '@/types';
import AppHeader from '@/components/layout/AppHeader';
import CategoryBadge from '@/components/report/CategoryBadge';
import StatusBadge from '@/components/report/StatusBadge';
import DynamicMap from '@/components/map/DynamicMap';
import { DetailSkeleton } from '@/components/ui/Skeleton';
import { BackButton } from '@/components/ui/BackButton';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  User, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Loader2,
  ShieldCheck,
  MessageSquare,
  Send,
  Clock,
  Flag,
  AlertTriangle
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Birokrasi quick feedback form
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackStatusInput, setFeedbackStatusInput] = useState<ReportStatus>('diproses');
  const [feedbackPriorityInput, setFeedbackPriorityInput] = useState<ReportPriority>('sedang');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  useEffect(() => {
    // 1. Ambil info user yang sedang login
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setCurrentUser(res.data);
        }
      })
      .catch(() => {});

    // 2. Ambil detail laporan
    if (id) {
      fetch(`/api/reports/${id}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            setReport(res.data);
            setFeedbackInput(res.data.feedback || '');
            setFeedbackStatusInput(res.data.status || 'diproses');
            setFeedbackPriorityInput(res.data.priority || 'sedang');
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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInput.trim()) return;

    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/reports/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedbackInput.trim(),
          status: feedbackStatusInput,
          priority: feedbackPriorityInput,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setReport((prev) => ({
          ...(prev || {}),
          ...(json.data || {}),
          status: feedbackStatusInput,
          feedback: feedbackInput.trim(),
        }));
        router.refresh();
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(currentUser?.role === 'birokrasi' ? '/birokrasi' : '/');
        }
      } else {
        alert(json.message || 'Gagal menyimpan tanggapan');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const isOwner = currentUser?.id && report && report.user_id === currentUser.id;
  const isBirokrasi = currentUser?.role === 'birokrasi';

  return (
    <div className="flex-1 flex flex-col bg-neutral-50 pb-12">
      <AppHeader
        title="Detail Laporan Fasilitas"
        showBack={true}
        backHref={isBirokrasi ? '/birokrasi' : '/'}
        rightAction={
          isOwner ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/laporan/${id}/edit`}
                className="px-3 py-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors border border-primary/20"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-3 py-1.5 text-danger bg-danger/10 hover:bg-danger/20 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors border border-danger/20"
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
          <div className="p-8 bg-white rounded-3xl border border-neutral-100 shadow-xs text-center max-w-md mx-auto my-6">
            <AlertCircle className="w-10 h-10 text-danger mx-auto mb-2" />
            <h2 className="text-base font-bold text-neutral-900 mb-1">Laporan Tidak Ditemukan</h2>
            <p className="text-xs text-neutral-500 mb-4">{error}</p>
            <BackButton href="/" label="Kembali ke Beranda" variant="primary" />
          </div>
        )}

        {!loading && report && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Kolom Kiri: Foto & Deskripsi (7 Kolom di Desktop) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Foto Besar */}
              <div className="w-full h-64 sm:h-80 md:h-96 bg-neutral-100 rounded-3xl overflow-hidden border border-neutral-200 shadow-xs relative">
                {report.photo_url ? (
                  <img
                    src={report.photo_url}
                    alt={report.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50">
                    <Building2 className="w-12 h-12 stroke-[1.2] mb-1" />
                    <span className="text-xs font-semibold">Foto bukti fisik tidak dilampirkan</span>
                  </div>
                )}
              </div>

              {/* Deskripsi Kerusakan */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-100 shadow-xs space-y-2">
                <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                  Deskripsi Kerusakan
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line font-medium">
                  {report.description}
                </p>
              </div>

              {/* ── KOTAK TANGGAPAN RESMI BIROKRASI KAMPUS ── */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                        Tindak Lanjut & Tanggapan Birokrasi
                      </h3>
                      <p className="text-[10px] text-neutral-400">Respon resmi dari pengelola fasilitas kampus</p>
                    </div>
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                {/* Info Prioritas & Batas Waktu */}
                {(report.priority || report.deadline_at) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs pt-1">
                    {report.priority && (
                      <div className="inline-flex items-center gap-1.5 font-bold">
                        <Flag className="w-3.5 h-3.5 text-primary" />
                        <span className="text-neutral-600">Prioritas:</span>
                        <span
                          className={
                            REPORT_PRIORITIES.find((p) => p.id === report.priority)?.textColor ||
                            'text-neutral-900'
                          }
                        >
                          {REPORT_PRIORITIES.find((p) => p.id === report.priority)?.label ||
                            report.priority}
                        </span>
                      </div>
                    )}
                    {report.deadline_at && (
                      <div className="inline-flex items-center gap-1.5 text-neutral-600 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Batas Waktu:</span>
                        <span className={isReportOverdue(report) ? 'text-red-600 font-bold' : 'text-neutral-900'}>
                          {new Date(report.deadline_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {isReportOverdue(report) && (
                  <div className="p-3.5 bg-red-50 border-2 animate-overdue-border rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>Laporan Melewati Batas Waktu, Mohon ditindak lanjuti</span>
                  </div>
                )}

                {report.feedback ? (
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2">
                    <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                      &ldquo;{report.feedback}&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-neutral-200/60 font-semibold">
                      <span>Ditanggapi oleh: <strong className="text-primary">{report.feedback_by_name || 'Birokrasi Sarpras'}</strong></span>
                      {report.feedback_at && (
                        <span>
                          {new Date(report.feedback_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Belum ada catatan tanggapan resmi dari pihak kampus. Laporan ini sedang berada di antrean pengecekan staf sarana dan prasarana.
                    </p>
                  </div>
                )}

                {/* Form Khusus untuk Birokrasi Kampus */}
                {isBirokrasi && (
                  <form onSubmit={handleFeedbackSubmit} className="mt-4 pt-3 border-t border-neutral-100 space-y-3">
                    <p className="text-xs font-bold text-neutral-900">Kirim / Perbarui Tanggapan Birokrasi:</p>
                    <div className="flex gap-2">
                      {(['diproses', 'selesai', 'ditolak'] as ReportStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFeedbackStatusInput(st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                            feedbackStatusInput === st
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-neutral-600 mb-1.5">Prioritas & Batas Waktu:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {REPORT_PRIORITIES.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setFeedbackPriorityInput(p.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all text-center ${
                              feedbackPriorityInput === p.id
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            {p.label} ({p.days} Hari)
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="Tuliskan respon resmi dan instruksi perbaikan fasilitas..."
                      className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {feedbackSuccess && (
                      <p className="text-xs font-bold text-success">{feedbackSuccess}</p>
                    )}
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingFeedback ? 'Menyimpan...' : 'Perbarui Tanggapan'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Metadata & Peta Leaflet (5 Kolom di Desktop) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Informasi Utama */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-100 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <CategoryBadge category={report.category} size="md" />
                    <StatusBadge status={report.status} />
                  </div>
                  <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
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

                <h1 className="text-lg font-extrabold text-neutral-900 leading-snug">
                  {report.title}
                </h1>

                <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      Fasilitas:{' '}
                      <strong className="text-neutral-900 font-bold">
                        {report.facility_name}
                      </strong>
                      {report.facility_building ? ` (${report.facility_building})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span>
                      Pelapor:{' '}
                      <strong className="text-neutral-900 font-bold">
                        {report.user_name || 'Mahasiswa'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Peta Lokasi Leaflet */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                      Titik Lokasi di Kampus
                    </h3>
                  </div>
                  {report.latitude && report.longitude && (
                    <span className="text-[10px] text-neutral-400 font-mono font-bold">
                      {Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)}
                    </span>
                  )}
                </div>

                <DynamicMap
                  latitude={Number(report.latitude) || -7.05041}
                  longitude={Number(report.longitude) || 110.43512}
                  interactive={false}
                  popupText={`${report.title} (${report.facility_name})`}
                  height="220px"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-3 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-extrabold text-neutral-900">Hapus Laporan Ini?</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Laporan ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
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
