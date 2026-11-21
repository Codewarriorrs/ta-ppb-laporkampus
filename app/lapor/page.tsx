'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { Facility, CATEGORIES, Category } from '@/types';
import DynamicMap from '@/components/map/DynamicMap';
import { 
  Camera, 
  MapPin, 
  Navigation, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Building2,
  Tag
} from 'lucide-react';

function CreateReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFacility = searchParams.get('facility_id') || '';

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);

  // Form State
  const [facilityId, setFacilityId] = useState(preselectedFacility);
  const [category, setCategory] = useState<Category>('AC');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Photo State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Geolocation & Map State (Default koordinat kampus)
  const [latitude, setLatitude] = useState<number>(-7.05041);
  const [longitude, setLongitude] = useState<number>(110.43512);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>('Lokasi Default Kampus');

  // Submit & Feedback State
  const [submitting, setSubmitting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/facilities')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setFacilities(res.data);
          if (!facilityId && res.data.length > 0) {
            setFacilityId(res.data[0].id);
          }
        }
      })
      .finally(() => setLoadingFacilities(false));
  }, []);

  // Update jika param berubah
  useEffect(() => {
    if (preselectedFacility) {
      setFacilityId(preselectedFacility);
    }
  }, [preselectedFacility]);

  // Handler Ambil Foto / File
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatusFeedback({
        type: 'error',
        message: 'Ukuran foto maksimal adalah 5MB.',
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const removePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Handler Geolocation API
  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) {
      setStatusFeedback({
        type: 'error',
        message: 'Browser perangkat Anda tidak mendukung fitur Geolocation GPS.',
      });
      return;
    }

    setGettingLocation(true);
    setStatusFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        setLocationAddress(`GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)} (Akurat)`);
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        let msg = 'Gagal mendeteksi lokasi GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Izin akses lokasi GPS ditolak oleh browser/perangkat.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Informasi lokasi GPS tidak tersedia.';
        }
        setStatusFeedback({
          type: 'error',
          message: msg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Handler Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusFeedback(null);

    if (!facilityId) {
      setStatusFeedback({
        type: 'error',
        message: 'Silakan pilih fasilitas yang rusak.',
      });
      return;
    }

    if (!title.trim() || !description.trim()) {
      setStatusFeedback({
        type: 'error',
        message: 'Judul dan deskripsi laporan wajib diisi.',
      });
      return;
    }

    setSubmitting(true);

    try {
      let uploadedPhotoUrl: string | null = null;

      // 1. Unggah foto ke storage jika ada file yang dipilih
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.message || 'Gagal mengunggah foto bukti');
        }

        uploadedPhotoUrl = uploadData.data.url;
      }

      // 2. Simpan data laporan ke database
      const reportRes = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: facilityId,
          category,
          title: title.trim(),
          description: description.trim(),
          photo_url: uploadedPhotoUrl,
          latitude,
          longitude,
        }),
      });

      const reportData = await reportRes.json();

      if (!reportRes.ok || !reportData.success) {
        throw new Error(reportData.message || 'Gagal menyimpan laporan');
      }

      // Berhasil
      setStatusFeedback({
        type: 'success',
        message: 'Laporan kerusakan fasilitas kampus berhasil dikirim!',
      });

      // Redirect setelah feedback singkat
      setTimeout(() => {
        router.push(`/laporan/${reportData.data.id}`);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setStatusFeedback({
        type: 'error',
        message: err.message || 'Terjadi kesalahan sistem saat mengirim laporan.',
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 pb-10">
      {/* Toast Notifikasi / Feedback */}
      {statusFeedback && (
        <div
          className={`mb-4 p-3.5 rounded-xl text-xs flex items-start gap-2.5 shadow-sm transition-all ${
            statusFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {statusFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-medium leading-relaxed">{statusFeedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card 1: Fasilitas & Kategori */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Lokasi Fasilitas</span>
          </h2>

          {/* Select Fasilitas */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Pilih Gedung / Fasilitas <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              disabled={loadingFacilities}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {loadingFacilities ? (
                <option value="">Memuat data fasilitas...</option>
              ) : (
                facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.building}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Select Kategori */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Kategori Kerusakan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-semibold'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Rincian Kerusakan */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Detail Laporan</span>
          </h2>

          {/* Judul Laporan */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Judul Laporan Singkat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: AC Ruang 204 Mengeluarkan Bau Gosong"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Deskripsi Kerusakan */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Deskripsi Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan kondisi kerusakan, nomor unit peralatan, atau instruksi spesifik lainnya..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>
        </div>

        {/* Card 3: Foto Bukti (Kamera / File) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>Foto Bukti Fisik</span>
          </h2>

          {previewUrl ? (
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 group">
              <img src={previewUrl} alt="Preview Bukti" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* Kamera Smartphone Langsung */}
              <label className="flex flex-col items-center justify-center p-4 bg-blue-50/50 hover:bg-blue-50 border border-dashed border-blue-200 rounded-xl cursor-pointer transition-all active:scale-95 text-center">
                <Camera className="w-6 h-6 text-blue-600 mb-1" />
                <span className="text-xs font-bold text-blue-700">Buka Kamera</span>
                <span className="text-[10px] text-gray-500">Ambil foto langsung</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>

              {/* Pilih dari Galeri */}
              <label className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl cursor-pointer transition-all active:scale-95 text-center">
                <Tag className="w-6 h-6 text-gray-500 mb-1" />
                <span className="text-xs font-bold text-gray-700">Pilih Berkas</span>
                <span className="text-[10px] text-gray-500">Dari galeri foto (maks 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Card 4: Lokasi Peta & Geolocation */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Titik Lokasi di Kampus</span>
            </h2>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gettingLocation}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors active:scale-95"
            >
              {gettingLocation ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Navigation className="w-3 h-3" />
              )}
              <span>Gunakan Lokasi Saya</span>
            </button>
          </div>

          <p className="text-[11px] text-gray-500">
            Koordinat: {latitude.toFixed(5)}, {longitude.toFixed(5)}. Geser pin peta di bawah jika ingin menyesuaikan titik pasti.
          </p>

          <DynamicMap
            latitude={latitude}
            longitude={longitude}
            interactive={true}
            onLocationSelect={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
              setLocationAddress(`Pin Manual: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }}
            height="180px"
          />
        </div>

        {/* Tombol Kirim Laporan */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mengirim Laporan...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Kirimkan Laporan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function CreateReportPage() {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <AppHeader title="Buat Laporan Baru" />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-8 text-xs text-gray-400">Memuat formulir...</div>}>
        <CreateReportForm />
      </Suspense>
    </div>
  );
}
