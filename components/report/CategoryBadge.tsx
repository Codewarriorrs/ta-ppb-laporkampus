import React from 'react';
import { Category } from '@/types';
import { 
  AirVent, 
  Lightbulb, 
  Armchair, 
  Bath, 
  Projector, 
  Wifi, 
  Layers 
} from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

const CATEGORY_MAP: Record<Category, { icon: React.ElementType; label: string }> = {
  'AC': { icon: AirVent, label: 'AC' },
  'Lampu': { icon: Lightbulb, label: 'Lampu' },
  'Kursi/Meja': { icon: Armchair, label: 'Kursi & Meja' },
  'Toilet': { icon: Bath, label: 'Sanitasi / Toilet' },
  'Proyektor': { icon: Projector, label: 'Proyektor' },
  'Jaringan/WiFi': { icon: Wifi, label: 'WiFi & Jaringan' },
  'Lainnya': { icon: Layers, label: 'Lainnya' },
};

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const item = CATEGORY_MAP[category] || { icon: Layers, label: category };
  const Icon = item.icon;

  const sizeClass = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5 gap-1.5' 
    : 'text-xs px-2.5 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-800 border border-slate-200/80 ${sizeClass}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 text-slate-600' : 'w-3.5 h-3.5 text-slate-600'} />
      <span>{item.label}</span>
    </span>
  );
}
