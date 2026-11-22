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
  'Toilet': { icon: Bath, label: 'Toilet' },
  'Proyektor': { icon: Projector, label: 'Proyektor' },
  'Jaringan/WiFi': { icon: Wifi, label: 'WiFi' },
  'Lainnya': { icon: Layers, label: 'Lainnya' },
};

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const item = CATEGORY_MAP[category] || { icon: Layers, label: category };
  const Icon = item.icon;

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600">
      <Icon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
      <span>{item.label}</span>
    </span>
  );
}
