'use client';

import React from 'react';
import Link from 'next/link';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  withSubtitle?: boolean;
  href?: string;
}

export function AppLogoIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-[12px]',
    md: 'w-11 h-11 rounded-[16px]',
    lg: 'w-16 h-16 rounded-[22px]',
  };

  return (
    <div
      className={`${sizeMap[size]} relative flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105`}
    >
      <img
        src="/LaporKampus_Logo.png"
        alt="LaporKampus Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export default function AppLogo({
  size = 'md',
  withText = true,
  withSubtitle = true,
  href = '/',
}: AppLogoProps) {
  const content = (
    <div className="flex items-center gap-3 group select-none">
      <AppLogoIcon size={size} />
      {withText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-neutral-900 text-lg leading-tight tracking-tight font-display group-hover:text-primary transition-colors">
            Lapor<span className="text-primary">Kampus</span>
          </span>
          {withSubtitle && (
            <span className="text-[11px] font-medium text-neutral-500 tracking-normal font-sans">
              Sistem Sarana & Prasarana
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
