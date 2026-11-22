import React from 'react';
import { ReportStatus } from '@/types';
import { Clock, CheckCircle2, Wrench, XCircle, CloudOff } from 'lucide-react';

interface StatusBadgeProps {
  status?: ReportStatus;
  isOffline?: boolean;
  className?: string;
}

export default function StatusBadge({ status = 'menunggu', isOffline, className = '' }: StatusBadgeProps) {
  if (isOffline) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent-light text-accent-dark border border-accent/40 ${className}`}>
        <CloudOff className="w-3 h-3" />
        <span>Offline</span>
      </span>
    );
  }

  const map: Record<ReportStatus, { label: string; color: string; icon: React.ElementType }> = {
    menunggu: {
      label: 'Menunggu',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock,
    },
    diproses: {
      label: 'Diproses',
      color: 'bg-primary-50 text-primary border-primary-200',
      icon: Wrench,
    },
    selesai: {
      label: 'Selesai',
      color: 'bg-mint-light text-mint-dark border-mint/50',
      icon: CheckCircle2,
    },
    ditolak: {
      label: 'Ditolak',
      color: 'bg-danger-light text-danger border-danger/20',
      icon: XCircle,
    },
  };

  const item = map[status] || map.menunggu;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${item.color} ${className}`}
    >
      <Icon className="w-3 h-3 stroke-[2.2]" />
      <span>{item.label}</span>
    </span>
  );
}
