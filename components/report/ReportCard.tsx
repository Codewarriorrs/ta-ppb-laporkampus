import React from 'react';
import Link from 'next/link';
import { Report } from '@/types';
import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';
import { MapPin, Calendar, Image as ImageIcon, MessageSquare } from 'lucide-react';

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
  return (
    <Link
      href={`/laporan/${report.id}`}
      className="block bg-white rounded-2xl border border-neutral-100 shadow-xs hover:border-neutral-200 hover:shadow-md transition-all duration-200 active:scale-[0.99] overflow-hidden group"
    >
      <div className="flex p-3.5 sm:p-4 gap-3.5">
        {/* Foto Thumbnail */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-neutral-50 rounded-xl overflow-hidden border border-neutral-100">
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
              <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3" />
                {formatTimeAgo(report.created_at)}
              </span>
            </div>

            <h3 className="font-bold text-neutral-900 text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {report.title}
            </h3>
          </div>

          <div>
            {report.feedback && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-primary font-semibold truncate bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                <MessageSquare className="w-3 h-3 shrink-0" />
                <span className="truncate">Ditanggapi: &ldquo;{report.feedback}&rdquo;</span>
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center text-xs text-neutral-600 line-clamp-1 gap-1.5">
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
