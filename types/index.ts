export type Category =
  | 'AC'
  | 'Lampu'
  | 'Kursi/Meja'
  | 'Toilet'
  | 'Proyektor'
  | 'Jaringan/WiFi'
  | 'Lainnya';

export const CATEGORIES: Category[] = [
  'AC',
  'Lampu',
  'Kursi/Meja',
  'Toilet',
  'Proyektor',
  'Jaringan/WiFi',
  'Lainnya',
];

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface Facility {
  id: string;
  name: string;
  building: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  report_count?: number;
}

export interface Report {
  id: string;
  user_id: string;
  facility_id: string;
  category: Category;
  title: string;
  description: string;
  photo_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  // Joined fields
  user_name?: string;
  facility_name?: string;
  facility_building?: string;
  facilities?: Facility;
  users?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface JWTPayload {
  userId: string;
  name: string;
  email: string;
  exp?: number;
}
