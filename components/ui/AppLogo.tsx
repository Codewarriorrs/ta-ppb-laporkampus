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
    sm: 'w-8 h-8 rounded-[14px]',
    md: 'w-11 h-11 rounded-[18px]',
    lg: 'w-16 h-16 rounded-[26px]',
  };

  const iconSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-9 h-9',
  };

  return (
    <div
      className={`${sizeMap[size]} relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 60%, #0f172a 100%)',
        boxShadow:
          '0 10px 25px -5px rgba(30, 58, 138, 0.45), inset 0 2px 2px rgba(255, 255, 255, 0.45), inset 0 -2px 4px rgba(15, 23, 42, 0.35)',
      }}
    >
      {/* 3D Soft Light Reflection Layer */}
      <div className="absolute inset-x-1.5 top-1 h-[35%] bg-gradient-to-b from-white/35 to-transparent rounded-t-[14px] pointer-events-none" />

      {/* Modern Soft 3D Geometric Campus Report Emblem */}
      <svg
        className={`${iconSizeMap[size]} text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] relative z-10`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Isometric Cube / Building Base */}
        <path
          d="M12 2L3 7L12 12L21 7L12 2Z"
          fill="white"
          fillOpacity="0.9"
        />
        <path
          d="M3 7V17L12 22V12L3 7Z"
          fill="white"
          fillOpacity="0.75"
        />
        <path
          d="M21 7V17L12 22V12L21 7Z"
          fill="white"
          fillOpacity="0.6"
        />
        {/* Pin Accent in Soft Warm Coral */}
        <circle cx="12" cy="7" r="2.2" fill="#ff9e7d" />
      </svg>
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
