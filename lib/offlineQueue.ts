import { Report } from '@/types';

export interface OfflineReportItem {
  tempId: string;
  facility_id: string;
  facility_name?: string;
  category: string;
  title: string;
  description: string;
  photo_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}

const STORAGE_KEY = 'laporkampus_offline_reports';

export function getOfflineReports(): OfflineReportItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Gagal membaca antrean offline:', e);
    return [];
  }
}

export function saveOfflineReport(
  payload: Omit<OfflineReportItem, 'tempId' | 'created_at' | 'status'>
): OfflineReportItem {
  let list = getOfflineReports();
  const newItem: OfflineReportItem = {
    ...payload,
    tempId: 'offline-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
    status: 'pending',
  };
  list.unshift(newItem);

  // Batasi maksimal 20 antrean offline untuk menghindari batas kuota storage
  if (list.length > 20) {
    list = list.slice(0, 20);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('offline-reports-changed'));
  } catch (e) {
    console.warn('Quota exceeded, mencoba menghapus foto dari antrean terlama:', e);
    try {
      // Jika kuota penuh, kompres/hapus foto dari laporan terlama
      list.forEach((item, idx) => {
        if (idx > 2 && item.photo_url) item.photo_url = null;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('offline-reports-changed'));
    } catch (err2) {
      console.error('Gagal menyimpan laporan offline:', err2);
    }
  }
  return newItem;
}

export function removeOfflineReport(tempId: string): void {
  const list = getOfflineReports().filter((r) => r.tempId !== tempId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('offline-reports-changed'));
  } catch (e) {
    console.error('Gagal memperbarui antrean offline:', e);
  }
}

export async function syncOfflineReports(): Promise<{ synced: number; failed: number; message?: string }> {
  if (typeof window === 'undefined') return { synced: 0, failed: 0 };
  if (!navigator.onLine) {
    return { synced: 0, failed: 0, message: 'Perangkat sedang offline.' };
  }

  const list = getOfflineReports();
  if (list.length === 0) return { synced: 0, failed: 0, message: 'Tidak ada laporan offline.' };

  let synced = 0;
  let failed = 0;
  let lastErrorMessage = '';

  for (const item of [...list]) {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facility_id: item.facility_id,
          category: item.category,
          title: item.title,
          description: item.description,
          photo_url: item.photo_url || null,
          latitude: item.latitude || null,
          longitude: item.longitude || null,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        removeOfflineReport(item.tempId);
        synced++;
      } else {
        lastErrorMessage = result.message || 'Gagal menyimpan laporan ke server.';
        failed++;
      }
    } catch (err: any) {
      console.error('Sinkronisasi laporan offline gagal:', err);
      lastErrorMessage = err?.message || 'Gagal terhubung ke server.';
      failed++;
    }
  }

  window.dispatchEvent(new Event('offline-reports-changed'));
  return { synced, failed, message: lastErrorMessage };
}

/**
 * Konversi OfflineReportItem menjadi bentuk Report untuk ditampilkan di UI
 */
export function offlineItemToReport(item: OfflineReportItem): Report {
  return {
    id: item.tempId,
    user_id: 'current-user',
    facility_id: item.facility_id,
    category: item.category as any,
    title: item.title,
    description: item.description,
    photo_url: item.photo_url,
    latitude: item.latitude,
    longitude: item.longitude,
    status: 'menunggu',
    created_at: item.created_at,
    facility_name: item.facility_name || 'Fasilitas Kampus',
    user_name: 'Saya (Offline)',
    is_offline: true,
  };
}
