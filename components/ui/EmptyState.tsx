import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const label = actionLabel || actionText;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-neutral-100 shadow-xs my-4">
      <div className="w-14 h-14 bg-primary-50 text-primary rounded-2xl flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 stroke-[1.8]" />
      </div>
      <h3 className="text-base font-bold text-neutral-900 mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 max-w-xs mb-4 leading-relaxed">{description}</p>
      {label && (
        actionHref ? (
          <Link
            href={actionHref}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-sm shadow-primary/20 active:scale-95 transition-all"
          >
            {label}
          </Link>
        ) : onAction ? (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-sm shadow-primary/20 active:scale-95 transition-all"
          >
            {label}
          </button>
        ) : null
      )}
    </div>
  );
}
