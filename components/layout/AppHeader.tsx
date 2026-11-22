'use client';

import React from 'react';
import { BackButton } from '@/components/ui/BackButton';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export default function AppHeader({ title, showBack = false, backHref, rightAction }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack && (
          <BackButton
            href={backHref}
            size="sm"
            variant="outline"
            label="Kembali"
            className="shrink-0"
          />
        )}
        <h1 className="text-base font-bold text-neutral-900 line-clamp-1">{title}</h1>
      </div>

      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </header>
  );
}
