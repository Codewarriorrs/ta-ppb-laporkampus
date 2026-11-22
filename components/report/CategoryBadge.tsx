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
  'Toilet': { icon: Bath, label: 'Sanitasi' },
  'Proyektor': { icon: Projector, label: 'Proyektor' },
  'Jaringan/WiFi': { icon: Wifi, label: 'WiFi' },
  'Lainnya': { icon: Layers, label: 'Lainnya' },
};

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const item = CATEGORY_MAP[category] || { icon: Layers, label: category };
  const Icon = item.icon;

  const sizeClass = size === 'sm' 
    ? 'text-[10px] px-2 py-0.5 gap-1.5' 
    : 'text-xs px-2.5 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-[10px] bg-surface-strong text-primary border border-primary/15 ${sizeClass}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 text-primary' : 'w-3.5 h-3.5 text-primary'} />
      <span>{item.label}</span>
    </span>
  );
}
