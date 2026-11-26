import React from 'react';
import Link from 'next/link';
import { Report, REPORT_PRIORITIES, isReportOverdue } from '@/types';
import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';
import { MapPin, Calendar, Image as ImageIcon, MessageSquare, AlertTriangle, Flag } from 'lucide-react';

interface ReportCardProps {
  report: Report;
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mnt lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Beberapa waktu lalu';
  }
}

export default function ReportCard({ report }: ReportCardProps) {
  const overdue = isReportOverdue(report);
  const priorityInfo = report.priority
    ? REPORT_PRIORITIES.find((p) => p.id === report.priority)
    : null;

  return (
    <Link
      href={`/laporan/${report.id}`}
      className={`block bg-surface rounded-[24px] shadow-card-3d hover:shadow-soft-3d hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.99] overflow-hidden group ${
        overdue
          ? 'border-2 animate-overdue-border'
          : 'border border-white/80 ring-1 ring-neutral-200/60'
      }`}
    >
      <div className="flex p-4 gap-4">
        {/* Foto Thumbnail */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-neutral-100/70 rounded-[18px] overflow-hidden border border-neutral-200/60">
          {report.photo_url ? (
            <img
              src={report.photo_url}
              alt={report.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50">
              <ImageIcon className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[10px] mt-1 font-semibold text-neutral-400">Tanpa Foto</span>
            </div>
          )}
        </div>

        {/* Info Konten */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <CategoryBadge category={report.category} />
                <StatusBadge status={report.status} isOffline={report.is_offline} />
              </div>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-medium font-sans">
                <Calendar className="w-3 h-3" />
                {formatTimeAgo(report.created_at)}
              </span>
            </div>

            <h3 className="font-extrabold text-neutral-900 text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug font-display">
              {report.title}
            </h3>
          </div>

          <div>
            {(priorityInfo || overdue) && (
              <div className="mt-1.5 flex items-center gap-2.5 flex-wrap text-[11px] font-bold">
                {priorityInfo && (
                  <span className={`inline-flex items-center gap-1 ${priorityInfo.textColor}`}>
                    <Flag className="w-3 h-3" />
                    Prioritas {priorityInfo.label}
                  </span>
                )}
                {overdue && (
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    Melewati Batas Waktu
                  </span>
                )}
              </div>
            )}

            {report.feedback && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-primary font-semibold truncate bg-surface-strong px-2.5 py-1 rounded-[12px] border border-primary/15">
                <MessageSquare className="w-3 h-3 shrink-0" />
                <span className="truncate">Ditanggapi: &ldquo;{report.feedback}&rdquo;</span>
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center text-xs text-neutral-600 line-clamp-1 gap-1.5 font-sans">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
              <span className="truncate font-semibold text-neutral-700">
                {report.facility_name || 'Fasilitas Kampus'}
                {report.facility_building ? ` • ${report.facility_building}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
