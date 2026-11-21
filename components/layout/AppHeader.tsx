'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShieldAlert } from 'lucide-react';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function AppHeader({ title, showBack = false, rightAction }: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            aria-label="Kembali"
            className="p-1 -ml-1 text-gray-700 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{title}</h1>
      </div>

      {rightAction && <div>{rightAction}</div>}
    </header>
  );
}
