import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Report } from '@/types';
import CategoryBadge from './CategoryBadge';
import { MapPin, Calendar, Image as ImageIcon } from 'lucide-react';

interface ReportCardProps {
  report: Report;
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
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
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99] overflow-hidden group"
    >
      <div className="flex p-3 gap-3">
        {/* Foto Thumbnail */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
          {report.photo_url ? (
            <img
              src={report.photo_url}
              alt={report.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <ImageIcon className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[10px] mt-1">Tanpa Foto</span>
            </div>
          )}
        </div>

        {/* Info Konten */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <CategoryBadge category={report.category} />
              <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                <Calendar className="w-3 h-3" />
                {formatTimeAgo(report.created_at)}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
              {report.title}
            </h3>
          </div>

          <div className="mt-2 flex items-center text-xs text-gray-500 line-clamp-1 gap-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
            <span className="truncate">
              {report.facility_name || 'Fasilitas Kampus'}
              {report.facility_building ? ` • ${report.facility_building}` : ''}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
