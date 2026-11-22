'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { Facility, CATEGORIES, Category } from '@/types';
import { Camera, MapPin, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import DynamicMap from '@/components/map/DynamicMap';

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilityId, setFacilityId] = useState('');
  const [category, setCategory] = useState<Category>('AC');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number>(-7.0504);
  const [longitude, setLongitude] = useState<number>(110.4351);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ambil daftar fasilitas
    fetch('/api/facilities')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setFacilities(res.data);
        }
      });

    // Ambil detail laporan yang akan diedit
    if (id) {
      fetch(`/api/reports/${id}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) {
            const r = res.data;
            setFacilityId(r.facility_id);
            setCategory(r.category);
            setTitle(r.title);
            setDescription(r.description);
            setPhotoUrl(r.photo_url || null);
            if (r.latitude && r.longitude) {
              setLatitude(Number(r.latitude));
              setLongitude(Number(r.longitude));
            }
          } else {
            setError(res.message || 'Laporan tidak ditemukan');
          }
        })
        .catch(() => setError('Gagal memuat data laporan'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar (maksimal 5MB)');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPhotoUrl(data.data.url);
      } else {
        alert(data.message || 'Gagal mengunggah foto');
      }
    } catch {
      alert('Terjadi kesalahan saat mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: facilityId,
          category,
          title,
          description,
          photo_url: photoUrl,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal memperbarui laporan');
        setSubmitting(false);
        return;
      }

      router.push(`/laporan/${id}`);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan koneksi server');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-50/50 min-h-screen">
      <AppHeader title="Edit Laporan" showBack={true} />

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Memuat data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* Pilih Fasilitas */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
              <label className="block text-xs font-semibold text-neutral-700">Fasilitas Kampus</label>
              <select
                required
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Pilih Fasilitas / Gedung --</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.building})
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
              <label className="block text-xs font-semibold text-neutral-700">Kategori</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Judul & Deskripsi */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Judul Laporan
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Deskripsi Kerusakan
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            {/* Foto Bukti */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
              <label className="block text-xs font-semibold text-neutral-700">Foto Bukti</label>
              {photoUrl && (
                <div className="w-full h-40 rounded-xl overflow-hidden border border-neutral-200 relative mb-2">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 rounded-xl cursor-pointer text-xs font-medium text-neutral-600 transition-colors">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Camera className="w-4 h-4 text-neutral-500" />
                )}
                <span>{uploading ? 'Mengunggah...' : 'Ganti Foto Bukti'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Peta Pin */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
              <label className="block text-xs font-semibold text-neutral-700">
                Sesuaikan Lokasi di Peta
              </label>
              <DynamicMap
                latitude={latitude}
                longitude={longitude}
                interactive={true}
                onLocationSelect={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                height="160px"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
