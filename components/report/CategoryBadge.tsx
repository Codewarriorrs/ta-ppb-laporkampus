import React from 'react';
import { Category } from '@/types';
import { 
  AirVent, 
  Lightbulb, 
  Armchair, 
  Bath, 
  Projector, 
  Wifi, 
  HelpCircle 
} from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const getCategoryConfig = (cat: Category) => {
    switch (cat) {
      case 'AC':
        return {
          icon: AirVent,
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      case 'Lampu':
        return {
          icon: Lightbulb,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'Kursi/Meja':
        return {
          icon: Armchair,
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
        };
      case 'Toilet':
        return {
          icon: Bath,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'Proyektor':
        return {
          icon: Projector,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'Jaringan/WiFi':
        return {
          icon: Wifi,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'Lainnya':
      default:
        return {
          icon: HelpCircle,
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
        };
    }
  };

  const config = getCategoryConfig(category);
  const Icon = config.icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : 'px-2.5 py-1 text-xs font-medium gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{category}</span>
    </span>
  );
}
