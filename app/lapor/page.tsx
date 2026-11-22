'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { Facility, CATEGORIES, Category } from '@/types';
import DynamicMap from '@/components/map/DynamicMap';
import { saveOfflineReport } from '@/lib/offlineQueue';
import { compressImageToBase64 } from '@/lib/imageCompressor';
import { BackButton } from '@/components/ui/BackButton';
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
  Upload,
  CloudOff
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
  const [base64Photo, setBase64Photo] = useState<string | null>(null);
  
  // Geolocation & Map State (Default koordinat kampus)
  const [latitude, setLatitude] = useState<number>(-7.05041);
  const [longitude, setLongitude] = useState<number>(110.43512);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>('Lokasi Kampus');

  // Submit & Feedback State
  const [submitting, setSubmitting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
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
      .catch(() => {
        // Fallback list fasilitas jika offline
        setFacilities([
          { id: 'f0000000-0000-0000-0000-000000000001', name: 'Laboratorium Pemrograman & AI', building: 'Gedung Elektro Lt. 3' },
          { id: 'f0000000-0000-0000-0000-000000000002', name: 'Perpustakaan Pusat Kampus', building: 'Gedung Rektorat Lt. 2' },
          { id: 'f0000000-0000-0000-0000-000000000003', name: 'Ruang Kuliah 204 (GKB)', building: 'Gedung Kuliah Bersama Lt. 2' },
          { id: 'f0000000-0000-0000-0000-000000000004', name: 'Toilet Pria & Wanita Lt. 1 GKB', building: 'Gedung Kuliah Bersama Lt. 1' },
          { id: 'f0000000-0000-0000-0000-000000000005', name: 'Kantin Utama Kampus', building: 'Pusat Kegiatan Mahasiswa' },
        ]);
        if (!facilityId) setFacilityId('f0000000-0000-0000-0000-000000000001');
      })
      .finally(() => setLoadingFacilities(false));
  }, []);

  useEffect(() => {
    if (preselectedFacility) {
      setFacilityId(preselectedFacility);
    }
  }, [preselectedFacility]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setStatusFeedback({
        type: 'error',
        message: 'Ukuran foto maksimal adalah 10MB.',
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Kompresi foto secara cerdas agar tidak melebihi kuota 5MB localStorage saat offline
    try {
      const compressed = await compressImageToBase64(file, 1000, 0.75);
      setBase64Photo(compressed);
    } catch (err) {
      console.warn('Gagal kompresi foto:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Photo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedFile(null);
    setBase64Photo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) {
      setStatusFeedback({
        type: 'error',
        message: 'Perangkat Anda tidak mendukung fitur pendeteksi lokasi (Geolocation).',
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationAddress(`Akurasi GPS ±${Math.round(position.coords.accuracy)} meter`);
        setGettingLocation(false);
        setStatusFeedback({
          type: 'success',
          message: 'Titik koordinat berhasil didapatkan via GPS!',
        });
      },
      (error) => {
        setGettingLocation(false);
        let msg = 'Lokasi GPS tidak terdeteksi saat offline. Menggunakan titik koordinat default kampus.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Izin akses lokasi tidak aktif. Menggunakan koordinat default kampus.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Pencarian GPS melebihi batas waktu (offline). Menggunakan titik koordinat default kampus.';
        }
        setStatusFeedback({
          type: 'warning',
          message: msg,
        });
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facilityId) {
      setStatusFeedback({
        type: 'error',
        message: 'Harap pilih fasilitas yang mengalami kerusakan.',
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
    const currentFacility = facilities.find((f) => f.id === facilityId);

    // ── PENANGANAN OFFLINE ──
    // Jika tidak ada koneksi internet, simpan langsung ke antrean offline lokal
    if (!navigator.onLine) {
      saveOfflineReport({
        facility_id: facilityId,
        facility_name: currentFacility?.name || 'Fasilitas Kampus',
        category,
        title: title.trim(),
        description: description.trim(),
        photo_url: base64Photo,
        latitude,
        longitude,
      });

      setStatusFeedback({
        type: 'warning',
        message: 'Mode Offline: Laporan berhasil disimpan di perangkat Anda! Laporan akan otomatis disinkronkan saat terhubung kembali ke internet.',
      });

      setTimeout(() => {
        router.push('/laporan-saya');
      }, 1500);
      return;
    }

    // ── PENANGANAN ONLINE ──
    try {
      let uploadedPhotoUrl: string | null = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          uploadedPhotoUrl = uploadData.data.url;
        } else {
          // Jika upload gagal, gunakan base64
          uploadedPhotoUrl = base64Photo;
        }
      }

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
      // Jika terjadi Network Error saat mencoba fetch, simpan ke offline outbox
      saveOfflineReport({
        facility_id: facilityId,
        facility_name: currentFacility?.name || 'Fasilitas Kampus',
        category,
        title: title.trim(),
        description: description.trim(),
        photo_url: base64Photo,
        latitude,
        longitude,
      });

      setStatusFeedback({
        type: 'warning',
        message: 'Gagal terhubung ke server. Laporan telah disimpan di memori perangkat secara offline dan akan disinkronkan saat online.',
      });

      setTimeout(() => {
        router.push('/laporan-saya');
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:py-6 max-w-3xl mx-auto w-full pb-12">
      {/* Toast Feedback */}
      {statusFeedback && (
        <div
          className={`mb-4 p-4 rounded-2xl text-xs flex items-start gap-3 shadow-xs transition-all ${
            statusFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : statusFeedback.type === 'warning'
              ? 'bg-amber-50 border border-amber-200 text-amber-900'
              : 'bg-danger/10 border border-danger/20 text-danger'
          }`}
        >
          {statusFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : statusFeedback.type === 'warning' ? (
            <CloudOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          )}
          <span className="font-semibold leading-relaxed">{statusFeedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card 1: Fasilitas & Kategori */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-2.5">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Fasilitas & Kategori Kerusakan</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Select Fasilitas */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Pilih Gedung / Fasilitas <span className="text-danger">*</span>
              </label>
              <select
                required
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                disabled={loadingFacilities}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Kategori Kerusakan <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-2 text-center rounded-xl text-[11px] font-bold border transition-all ${
                      category === cat
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200/80 hover:bg-neutral-100'
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
        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-2.5">
            <Tag className="w-4 h-4 text-primary" />
            <span>Rincian Laporan</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Judul Laporan <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: AC Ruang 204 Mati dan Mengeluarkan Bau Hangus"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Deskripsi Kerusakan <span className="text-danger">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan kondisi kerusakan, nomor unit peralatan, atau instruksi teknis lainnya..."
              className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Card 3: Foto Bukti */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-2.5">
            <Camera className="w-4 h-4 text-primary" />
            <span>Foto Bukti Kerusakan</span>
          </h2>

          {previewUrl ? (
            <div className="relative w-full h-52 rounded-xl overflow-hidden border border-neutral-200 group">
              <img src={previewUrl} alt="Preview Bukti" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2.5 right-2.5 p-2 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col items-center justify-center p-5 bg-neutral-50 hover:bg-primary/5 border border-dashed border-neutral-300 hover:border-primary/40 rounded-2xl cursor-pointer transition-all text-center">
                <Camera className="w-6 h-6 text-primary mb-1.5" />
                <span className="text-xs font-bold text-neutral-900">Kamera Langsung</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">Ambil foto via kamera HP</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>

              <label className="flex flex-col items-center justify-center p-5 bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 rounded-2xl cursor-pointer transition-all text-center">
                <Upload className="w-6 h-6 text-neutral-500 mb-1.5" />
                <span className="text-xs font-bold text-neutral-900">Pilih Berkas Galeri</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">JPEG, PNG, WEBP (Maks 5MB)</span>
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
        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
            <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Titik Lokasi Kerusakan (Leaflet Map)</span>
            </h2>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gettingLocation}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-xl transition-colors"
            >
              {gettingLocation ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>Lokasi Saya</span>
            </button>
          </div>

          <p className="text-xs text-neutral-500">
            Koordinat: <strong className="font-mono text-neutral-800">{latitude.toFixed(5)}, {longitude.toFixed(5)}</strong>. Geser pin untuk memilih titik presisi.
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

        {/* Tombol Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-2xl shadow-md shadow-primary/20 border border-primary/20 transition-all active:scale-[0.99] disabled:opacity-60 text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Laporan...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 stroke-[2.2]" />
                <span>Kirim Laporan Kerusakan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LaporPage() {
  return (
    <div className="flex-1 flex flex-col bg-neutral-50">
      <AppHeader title="Form Lapor Fasilitas" showBack backHref="/" />
      <Suspense fallback={<div className="p-4 text-center text-xs text-neutral-400">Memuat formulir...</div>}>
        <CreateReportForm />
      </Suspense>
    </div>
  );
}
