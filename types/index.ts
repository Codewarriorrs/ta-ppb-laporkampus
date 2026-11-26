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

export type UserRole = 'mahasiswa' | 'birokrasi';

export type ReportStatus = 'menunggu' | 'diproses' | 'selesai' | 'ditolak';

export type ReportPriority = 'rendah' | 'sedang' | 'tinggi';

export const REPORT_PRIORITIES: {
  id: ReportPriority;
  label: string;
  days: number;
  textColor: string;
}[] = [
  { id: 'rendah', label: 'Rendah', days: 7, textColor: 'text-emerald-700' },
  { id: 'sedang', label: 'Sedang', days: 5, textColor: 'text-amber-700' },
  { id: 'tinggi', label: 'Tinggi', days: 3, textColor: 'text-rose-700' },
];

export function isReportOverdue(report: {
  status?: ReportStatus;
  deadline_at?: string | null;
}): boolean {
  if (report.status !== 'diproses' || !report.deadline_at) return false;
  return new Date(report.deadline_at).getTime() < Date.now();
}

export const REPORT_STATUSES: { id: ReportStatus; label: string; color: string }[] = [
  { id: 'menunggu', label: 'Menunggu', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'diproses', label: 'Diproses', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'selesai', label: 'Selesai', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'ditolak', label: 'Ditolak', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  email_verified?: boolean;
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
  status?: ReportStatus;
  priority?: ReportPriority | null;
  processed_at?: string | null;
  deadline_at?: string | null;
  feedback?: string | null;
  feedback_by?: string | null;
  feedback_by_name?: string | null;
  feedback_at?: string | null;
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
    role?: UserRole;
  };
  // Offline metadata
  is_offline?: boolean;
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
  role?: UserRole;
  exp?: number;
}
