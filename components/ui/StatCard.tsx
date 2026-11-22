"use client";

import { useState, useEffect } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  total?: number | null;
  icon: LucideIcon;
  color?: string;
  delay?: number;
  sublabel?: string;
}

export function StatCard({
  label,
  value,
  total,
  icon: Icon,
  color = "text-primary",
  delay = 0,
  sublabel,
}: StatCardProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = Math.max(1, Math.ceil(value / 10));
      const interval = setInterval(() => {
        start += step;
        if (start >= value) {
          setDisplayed(value);
          clearInterval(interval);
        } else {
          setDisplayed(start);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-4.5 sm:p-5 flex items-center gap-4 hover:border-neutral-200 shadow-xs transition-colors duration-200">
      <div className="p-3 rounded-xl bg-neutral-50 flex-shrink-0 border border-neutral-100/80">
        <Icon size={20} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-neutral-400 text-[11px] font-semibold uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-neutral-900 font-extrabold text-2xl leading-none mt-1">
          {displayed}
          {total !== undefined && total !== null && (
            <span className="text-neutral-400 text-xs font-normal ml-1">/ {total}</span>
          )}
        </p>
        {sublabel && (
          <p className="text-[11px] text-neutral-400 font-medium mt-1 truncate">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
