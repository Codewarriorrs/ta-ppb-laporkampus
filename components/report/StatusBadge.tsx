import React from 'react';
import { ReportStatus } from '@/types';
import { CloudOff } from 'lucide-react';

interface StatusBadgeProps {
  status?: ReportStatus;
  isOffline?: boolean;
  className?: string;
}

export default function StatusBadge({ status = 'menunggu', isOffline, className = '' }: StatusBadgeProps) {
  if (isOffline) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>Offline</span>
      </span>
    );
  }

  const map: Record<ReportStatus, { label: string; dotColor: string; textColor: string }> = {
    menunggu: {
      label: 'Menunggu',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-800',
    },
    diproses: {
      label: 'Diproses',
      dotColor: 'bg-primary',
      textColor: 'text-primary',
    },
    selesai: {
      label: 'Selesai',
      dotColor: 'bg-emerald-600',
      textColor: 'text-emerald-700',
    },
    ditolak: {
      label: 'Ditolak',
      dotColor: 'bg-rose-500',
      textColor: 'text-rose-700',
    },
  };

  const item = map[status] || map.menunggu;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${item.textColor} ${className}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${item.dotColor}`} />
      <span>{item.label}</span>
    </span>
  );
}
