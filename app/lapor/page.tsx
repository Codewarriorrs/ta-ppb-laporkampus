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
  Tag,
  Upload
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

  useEffect(() => {
    if (preselectedFacility) {
      setFacilityId(preselectedFacility);
    }
  }, [preselectedFacility]);

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

  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) {
      setStatusFeedback({
        type: 'error',
        message: 'Browser Anda tidak mendukung fitur Geolocation GPS.',
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
        setLocationAddress(`GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
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

      // Unggah foto ke storage jika ada file yang dipilih
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

      // Simpan data laporan ke database
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

      setStatusFeedback({
        type: 'success',
        message: 'Laporan kerusakan fasilitas kampus berhasil dikirim!',
      });

      setTimeout(() => {
        router.push(`/laporan/${reportData.data.id}`);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setStatusFeedback({
        type: 'error',
        message: err.message || 'Terjadi kesalahan sistem saat mengirim laporan.',
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:py-6 max-w-3xl mx-auto w-full pb-10">
      {/* Toast Feedback */}
      {statusFeedback && (
        <div
          className={`mb-4 p-3.5 rounded-lg text-xs flex items-start gap-2.5 shadow-xs transition-all ${
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Fasilitas & Kategori Kerusakan</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Select Fasilitas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Gedung / Fasilitas <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                disabled={loadingFacilities}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {loadingFacilities ? (
                  <option value="">Memuat data fasilitas...</option>
                ) : (
                  facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.building})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Select Kategori */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kategori Fasilitas <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-1.5 px-2 text-center rounded-md text-[11px] font-medium border transition-all ${
                      category === cat
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Rincian Kerusakan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <span>Rincian Laporan</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Judul Laporan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: AC Ruang 204 Mati dan Mengeluarkan Bau Hangus"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi Kerusakan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan kondisi kerusakan, nomor unit peralatan, atau instruksi teknis lainnya..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Card 3: Foto Bukti */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Foto Bukti Fisik Kerusakan</span>
          </h2>

          {previewUrl ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 group">
              <img src={previewUrl} alt="Preview Bukti" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center p-5 bg-slate-50 hover:bg-blue-50/50 border border-dashed border-slate-300 hover:border-blue-300 rounded-lg cursor-pointer transition-all text-center">
                <Camera className="w-6 h-6 text-blue-600 mb-1.5" />
                <span className="text-xs font-semibold text-slate-800">Kamera Langsung</span>
                <span className="text-[10px] text-slate-500">Ambil foto via kamera smartphone</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>

              <label className="flex flex-col items-center justify-center p-5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg cursor-pointer transition-all text-center">
                <Upload className="w-6 h-6 text-slate-600 mb-1.5" />
                <span className="text-xs font-semibold text-slate-800">Pilih Berkas Galeri</span>
                <span className="text-[10px] text-slate-500">JPEG, PNG, WEBP (Maksimal 5MB)</span>
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Titik Lokasi Kerusakan (Peta Leaflet)</span>
            </h2>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gettingLocation}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
            >
              {gettingLocation ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>Gunakan Lokasi Saya</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Koordinat saat ini: <strong className="font-mono text-slate-800">{latitude.toFixed(5)}, {longitude.toFixed(5)}</strong>. Anda dapat menggeser pin di bawah untuk presisi.
          </p>

          <DynamicMap
            latitude={latitude}
            longitude={longitude}
            interactive={true}
            onLocationSelect={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
              setLocationAddress(`Pin: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }}
            height="220px"
          />
        </div>

        {/* Tombol Kirim */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
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
        </div>
      </form>
    </div>
  );
}

export default function CreateReportPage() {
  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="Buat Laporan Baru" />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">Memuat formulir...</div>}>
        <CreateReportForm />
      </Suspense>
    </div>
  );
}
