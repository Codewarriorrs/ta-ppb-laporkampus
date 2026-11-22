"use client";

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getOfflineReports, syncOfflineReports, OfflineReportItem } from '@/lib/offlineQueue';

export function OfflineSyncBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    setOfflineCount(getOfflineReports().length);

    const handleOnline = async () => {
      setIsOnline(true);
      const pending = getOfflineReports();
      if (pending.length > 0) {
        setIsSyncing(true);
        const res = await syncOfflineReports();
        setIsSyncing(false);
        setOfflineCount(getOfflineReports().length);
        if (res.synced > 0) {
          setSyncSuccessMessage(`${res.synced} laporan offline berhasil disinkronkan ke server!`);
          setTimeout(() => setSyncSuccessMessage(null), 5000);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleReportsChanged = () => {
      setOfflineCount(getOfflineReports().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-reports-changed', handleReportsChanged);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-reports-changed', handleReportsChanged);
    };
  }, []);

  const handleManualSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    const res = await syncOfflineReports();
    setIsSyncing(false);
    setOfflineCount(getOfflineReports().length);
    if (res.synced > 0) {
      setSyncSuccessMessage(`${res.synced} laporan berhasil diunggah!`);
      setTimeout(() => setSyncSuccessMessage(null), 4000);
    }
  };

  return (
    <>
      {/* 1. Banner saat internet terputus (Offline) */}
      {!isOnline && (
        <div className="bg-neutral-900 text-white px-4 py-2.5 text-xs flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2 font-medium">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>Mode Offline aktif. Laporan baru tetap tersimpan di perangkat.</span>
          </div>
          {offlineCount > 0 && (
            <span className="bg-amber-400 text-neutral-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
              {offlineCount} antrean
            </span>
          )}
        </div>
      )}

      {/* 2. Banner ada laporan offline saat kembali online */}
      {isOnline && offlineCount > 0 && (
        <div className="bg-primary-dark text-white px-4 py-2 text-xs flex items-center justify-between sticky top-0 z-50 shadow-md border-b border-white/10">
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Terhubung. Ada <strong>{offlineCount} laporan offline</strong> siap diunggah.</span>
          </div>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 bg-accent text-neutral-900 hover:bg-accent-dark font-bold px-3 py-1 rounded-lg text-[11px] transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Mengunggah...' : 'Sinkronkan'}
          </button>
        </div>
      )}

      {/* 3. Toast Sukses Sinkronisasi */}
      {syncSuccessMessage && (
        <div className="bg-emerald-700 text-white px-4 py-2.5 text-xs flex items-center gap-2 sticky top-0 z-50 shadow-md transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span className="font-semibold">{syncSuccessMessage}</span>
        </div>
      )}
    </>
  );
}
