'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  MessageSquare,
  Building2,
  ExternalLink,
  ChevronRight,
  Send,
  UserCheck,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { Report, Facility, ReportStatus, REPORT_STATUSES, CATEGORIES } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import StatusBadge from '@/components/report/StatusBadge';
import CategoryBadge from '@/components/report/CategoryBadge';
import { BackButton } from '@/components/ui/BackButton';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function BirokrasiDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');

  // Modal Tanggapan
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<ReportStatus>('diproses');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, reportsRes, facilitiesRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/reports').then((r) => r.json()),
        fetch('/api/facilities').then((r) => r.json()),
      ]);

      if (userRes.success) setCurrentUser(userRes.data);
      if (reportsRes.success) setReports(reportsRes.data || []);
      if (facilitiesRes.success) setFacilities(facilitiesRes.data || []);
    } catch (e) {
      console.error('Gagal mengambil data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = reports.length;
    const menunggu = reports.filter((r) => !r.status || r.status === 'menunggu').length;
    const diproses = reports.filter((r) => r.status === 'diproses').length;
    const selesai = reports.filter((r) => r.status === 'selesai').length;
    return { total, menunggu, diproses, selesai };
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchSearch =
        search === '' ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        (item.facility_name && item.facility_name.toLowerCase().includes(search.toLowerCase()));

      const currentStatus = item.status || 'menunggu';
      const matchStatus = statusFilter === 'Semua' || currentStatus === statusFilter;
      const matchCategory = categoryFilter === 'Semua' || item.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [reports, search, statusFilter, categoryFilter]);

  const handleOpenFeedback = (report: Report) => {
    setSelectedReport(report);
    setFeedbackText(report.feedback || '');
    setFeedbackStatus(report.status === 'selesai' ? 'selesai' : 'diproses');
    setModalSuccess(null);
    setModalError(null);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    if (feedbackText.trim().length < 3) {
      setModalError('Tanggapan minimal 3 karakter.');
      return;
    }

    setSubmittingFeedback(true);
    setModalError(null);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedbackText,
          status: feedbackStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal menyimpan tanggapan.');
      }

      setModalSuccess('Tanggapan resmi birokrasi berhasil disimpan!');
      // Update local state
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id
            ? {
                ...r,
                status: feedbackStatus,
                feedback: feedbackText,
                feedback_by_name: currentUser?.name || 'Birokrasi Sarpras',
                feedback_at: new Date().toISOString(),
              }
            : r
        )
      );

      setTimeout(() => {
        setSelectedReport(null);
      }, 1200);
    } catch (err: any) {
      setModalError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const isBirokrasi = currentUser?.role === 'birokrasi';

  return (
    <div className="flex-1 flex flex-col pb-8">
      {/* ── HERO BANNER BERGAYA LMS-NKGTS ── */}
      <div className="bg-primary text-white px-5 sm:px-8 pt-8 pb-10 rounded-b-3xl shadow-md shadow-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                Pusat Kendali Fasilitas
              </span>
              <span className="bg-accent text-neutral-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                Birokrasi Kampus
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {currentUser?.name || 'Staf Birokrasi'}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-xl">
              Pantau laporan kerusakan sarana prasarana kampus dan kirimkan tanggapan resmi kepada mahasiswa secara real-time.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <BackButton href="/" label="Ke Beranda" variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20" />
          </div>
        </div>

        {/* Banner info akun jika sedang bukan birokrasi */}
        {!isBirokrasi && !loading && (
          <div className="mt-5 p-3.5 bg-accent/20 border border-accent/40 rounded-2xl flex items-center gap-3 text-neutral-900 text-xs">
            <AlertCircle className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1">
              <span className="font-bold text-white">Mode Pratinjau Penguji Responsi:</span>
              <span className="text-white/90 ml-1">
                Akun aktif Anda ({currentUser?.name}) berstatus <strong>Mahasiswa</strong>. Untuk mendemokan hak akses Birokrasi, Anda dapat login dengan akun seed: <strong>budi@kampus.ac.id</strong> (Password: <strong>password123</strong>).
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── STATS ROW (StatCard lms-nkgts) ── */}
      <div className="px-4 sm:px-6 -mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Laporan"
            value={stats.total}
            icon={ShieldAlert}
            color="text-primary"
            delay={0}
          />
          <StatCard
            label="Menunggu Respon"
            value={stats.menunggu}
            icon={Clock}
            color="text-amber-500"
            delay={100}
          />
          <StatCard
            label="Sedang Diproses"
            value={stats.diproses}
            icon={Wrench}
            color="text-primary-light"
            delay={200}
          />
          <StatCard
            label="Selesai Diperbaiki"
            value={stats.selesai}
            icon={CheckCircle2}
            color="text-success"
            delay={300}
          />
        </div>
      </div>

      {/* ── DAFTAR LAPORAN & FILTER ── */}
      <div className="px-4 sm:px-6 mt-6 space-y-4">
        {/* Controls: Search & Filter Tabs */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari judul laporan, deskripsi, atau fasilitas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Filter Kategori */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-primary shrink-0"
            >
              <option value="Semua">Semua Kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {['Semua', 'menunggu', 'diproses', 'selesai', 'ditolak'].map((st) => {
              const active = statusFilter === st;
              const count =
                st === 'Semua'
                  ? reports.length
                  : reports.filter((r) => (r.status || 'menunggu') === st).length;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-100'
                  }`}
                >
                  <span className="capitalize">{st === 'Semua' ? 'Semua Laporan' : st}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      active ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List of Reports */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl w-full" />
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <EmptyState
            title="Tidak Ada Laporan yang Cocok"
            description="Tidak ditemukan laporan dengan filter yang Anda pilih saat ini."
            actionLabel="Reset Filter"
            onAction={() => {
              setSearch('');
              setStatusFilter('Semua');
              setCategoryFilter('Semua');
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-neutral-100 p-4 sm:p-5 shadow-xs hover:border-neutral-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Info Kiri */}
                <div className="flex gap-3.5 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-neutral-50 shrink-0 border border-neutral-100">
                    {report.photo_url ? (
                      <img
                        src={report.photo_url}
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-neutral-400 text-[10px]">
                        Foto -
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={report.status} />
                      <CategoryBadge category={report.category} />
                      <span className="text-[11px] text-neutral-400 font-medium">
                        Oleh: <strong>{report.user_name || 'Mahasiswa'}</strong>
                      </span>
                    </div>

                    <Link
                      href={`/laporan/${report.id}`}
                      className="font-bold text-neutral-900 text-sm hover:text-primary transition-colors line-clamp-1"
                    >
                      {report.title}
                    </Link>

                    <p className="text-xs text-neutral-500 line-clamp-2">{report.description}</p>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium pt-1">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span>{report.facility_name}</span>
                      {report.facility_building && <span>• {report.facility_building}</span>}
                    </div>

                    {report.feedback && (
                      <div className="mt-2 p-2.5 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Tanggapan Birokrasi ({report.feedback_by_name || 'Staf'}):</span>
                        </div>
                        <p className="text-neutral-700 italic text-[11px]">&ldquo;{report.feedback}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tombol Aksi Kanan */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Link
                    href={`/laporan/${report.id}`}
                    className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-primary hover:border-primary transition-colors text-xs font-bold"
                    title="Buka Detail Laporan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenFeedback(report)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 border border-primary/20 transition-all active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{report.feedback ? 'Edit Tanggapan' : 'Tanggapi Laporan'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL FORM TANGGAPAN BIROKRASI ── */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-base">Tanggapan Resmi Birokrasi</h3>
                  <p className="text-[11px] text-neutral-400">Pembaruan status & tindak lanjut fasilitas</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="mt-4 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                <p className="font-bold text-neutral-900">{selectedReport.title}</p>
                <p className="text-neutral-500 text-[11px] mt-0.5">{selectedReport.facility_name}</p>
              </div>

              {/* Pilihan Status */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Ubah Status Penanganan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'diproses', label: 'Diproses', color: 'border-primary text-primary bg-primary/5' },
                    { id: 'selesai', label: 'Selesai', color: 'border-success text-success bg-success/5' },
                    { id: 'ditolak', label: 'Ditolak', color: 'border-danger text-danger bg-danger/5' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFeedbackStatus(item.id as ReportStatus)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        feedbackStatus === item.id
                          ? `${item.color} ring-2 ring-offset-1`
                          : 'border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Teks Tanggapan */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Pesan Tanggapan Resmi / Catatan Tindak Lanjut:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Contoh: Tim teknisi sarpras telah dihubungi dan suku cadang proyektor sedang dalam pengiriman. Pemasangan dilakukan besok."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger font-medium">
                  {modalError}
                </div>
              )}

              {modalSuccess && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-xs text-success font-medium">
                  {modalSuccess}
                </div>
              )}

              {/* Tombol Simpan */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  disabled={submittingFeedback}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingFeedback ? 'Menyimpan...' : 'Kirim Tanggapan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
