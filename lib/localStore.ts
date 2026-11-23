import { User, Facility, Report } from '@/types';

// In-memory persistent data store fallback saat Supabase belum dikonfigurasi
export interface StoreData {
  users: Array<{
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role?: 'mahasiswa' | 'birokrasi';
    email_verified?: boolean;
    verification_otp?: string | null;
    otp_expires_at?: string | null;
    created_at: string;
  }>;
  facilities: Facility[];
  reports: Array<Report & { user_id: string; facility_id: string }>;
}

const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    name: 'Lab. Sistem Tertanam & Robotika',
    building: 'Gedung Dept. Teknik Komputer Lt. 2',
    description: 'Laboratorium praktikum sistem mikroprosesor, mikrokontroler AVR/STM32, instrumentasi sensor IoT, dan riset robotika otomasi industri.',
    image_url: 'https://images.unsplash.com/photo-1517055729445-fa7d27394b48?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    name: 'Lab. Jaringan Komputer & Keamanan Siber',
    building: 'Gedung Dept. Teknik Komputer Lt. 2',
    description: 'Laboratorium infrastruktur jaringan komputer, switch & router Cisco, konfigurasi server Linux, praktikum perutean dan penetration testing keamanan jaringan.',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    name: 'Lab. Rekayasa Perangkat Lunak',
    building: 'Gedung Dept. Teknik Komputer Lt. 3',
    description: 'Laboratorium pemrograman desktop, web, aplikasi bergerak (mobile), dan basis data dengan 40 workstation spesifikasi tinggi.',
    image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    name: 'Lab. Multimedia & Pengolahan Sinyal',
    building: 'Gedung Dept. Teknik Komputer Lt. 3',
    description: 'Laboratorium pengolahan citra digital, computer vision, sistem multimedia, kecerdasan buatan, dan komputasi grafis GPU.',
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    name: 'Ruang Kuliah Teori TK-101',
    building: 'Gedung Dept. Teknik Komputer Lt. 1',
    description: 'Ruang kuliah berkapasitas 55 mahasiswa dengan proyektor laser LCD, pendingin ruangan ganda (AC), dan koneksi WiFi SIFT Undip.',
    image_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000006',
    name: 'Ruang Kuliah Teori TK-102',
    building: 'Gedung Dept. Teknik Komputer Lt. 1',
    description: 'Ruang perkuliahan interaktif dilengkapi smart podium, sound system terintegrasi, papan tulis kaca magnetik, dan 50 kursi kuliah ergonomis.',
    image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000007',
    name: 'Ruang Sidang Tugas Akhir & Seminar',
    building: 'Gedung Dept. Teknik Komputer Lt. 2',
    description: 'Ruang sidang tertutup untuk ujian seminar proposal, sidang tugas akhir sarjana, dan rapat pleno kurikulum departemen.',
    image_url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000008',
    name: 'Ruang Baca & Referensi Teknik Komputer',
    building: 'Gedung Dept. Teknik Komputer Lt. 2',
    description: 'Area studi mandiri dan ruang baca literatur tugas akhir, repositori skripsi mahasiswa, serta jurnal IEEE / ACM.',
    image_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000009',
    name: 'Toilet Mahasiswa & Dosen Lt. 2',
    building: 'Gedung Dept. Teknik Komputer Lt. 2',
    description: 'Fasilitas sanitasi toilet pria dan wanita lantai 2 dengan wastafel otomatis, hand dryer, dan cermin dinding.',
    image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000010',
    name: 'Gedung Kuliah Bersama (GKB) FT Undip',
    building: 'Kompleks Gedung Kuliah Bersama Tembalang',
    description: 'Ruang kuliah bersama fakultas teknik untuk mata kuliah umum dasar, matematika rekayasa, dan fisika komputasi.',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

const INITIAL_USERS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Ahmad Zaidan (Mahasiswa Tekkom)',
    email: 'zaidan@kampus.ac.id',
    password_hash: '$2a$10$it/nPIgNiTKiOdvw5zX6SuXbipmlNL8NcOgNHsRl6eAYY9uUeQLi6',
    role: 'mahasiswa' as const,
    email_verified: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Ir. Bambang S., M.T. (Pengelola Sarpras)',
    email: 'budi@kampus.ac.id',
    password_hash: '$2a$10$1lbUnSm1r5LfHElBnaYR3OpHjDtyxV/65JSewxOOWCNIVQrB5EuNi',
    role: 'birokrasi' as const,
    email_verified: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_REPORTS: Array<Report & { user_id: string; facility_id: string }> = [
  {
    id: 'r0000000-0000-0000-0000-000000000001',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    facility_id: 'f0000000-0000-0000-0000-000000000002',
    category: 'Jaringan/WiFi',
    title: 'Akses Poin WiFi SIFT di Lab Jaringan RTO dan Tidak Dapat IP',
    description: 'Akses poin WiFi di dekat rak server Lab Jaringan Komputer sering mengalami Request Time Out (RTO) dan mahasiswa praktikum tidak mendapat IP address dari DHCP server.',
    photo_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    latitude: -7.05041,
    longitude: 110.43512,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    facility_name: 'Lab. Jaringan Komputer & Keamanan Siber',
    facility_building: 'Gedung Dept. Teknik Komputer Lt. 2',
    user_name: 'Ahmad Zaidan (Mahasiswa Tekkom)',
    status: 'diproses',
    feedback: 'Laporan diterima oleh Tim Sarpras Tekkom. Staf IT sedang melakukan restart controller switch core dan konfigurasi ulang pool DHCP.',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000002',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    facility_id: 'f0000000-0000-0000-0000-000000000005',
    category: 'Proyektor',
    title: 'Proyektor Ruang TK-101 Tampilan Kuning & Port HDMI Longgar',
    description: 'Tampilan proyektor di ruang kuliah TK-101 berkedip dan warnanya menguning. Konektor kabel HDMI di podium dosen juga longgar sehingga sering putus layar saat kuliah umum.',
    photo_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    latitude: -7.05089,
    longitude: 110.43555,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    facility_name: 'Ruang Kuliah Teori TK-101',
    facility_building: 'Gedung Dept. Teknik Komputer Lt. 1',
    user_name: 'Ahmad Zaidan (Mahasiswa Tekkom)',
    status: 'selesai',
    feedback: 'Kabel splitter HDMI dan modul input proyektor telah diganti dengan suku cadang baru oleh tendik sarpras.',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000003',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    facility_id: 'f0000000-0000-0000-0000-000000000001',
    category: 'AC',
    title: 'AC Sisi Timur Lab Sistem Tertanam Bocor dan Menetes ke Meja Praktikum',
    description: 'Unit pendingin AC di atas meja praktikum osiloskop meneteskan air ke meja sehingga berisiko mengenai modul mikrokontroler mahasiswa.',
    photo_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    latitude: -7.05035,
    longitude: 110.43534,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    facility_name: 'Lab. Sistem Tertanam & Robotika',
    facility_building: 'Gedung Dept. Teknik Komputer Lt. 2',
    user_name: 'Ahmad Zaidan (Mahasiswa Tekkom)',
    status: 'menunggu',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000004',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    facility_id: 'f0000000-0000-0000-0000-000000000009',
    category: 'Toilet',
    title: 'Kran Wastafel Toilet Pria Lt. 2 Dol dan Air Mengalir Terus',
    description: 'Kran wastafel nomor 2 di toilet pria lantai 2 Teknik Komputer tidak dapat ditutup rapat sehingga air bersih terbuang terus-menerus.',
    photo_url: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?auto=format&fit=crop&w=800&q=80',
    latitude: -7.05112,
    longitude: 110.43578,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    facility_name: 'Toilet Mahasiswa & Dosen Lt. 2',
    facility_building: 'Gedung Dept. Teknik Komputer Lt. 2',
    user_name: 'Ahmad Zaidan (Mahasiswa Tekkom)',
    status: 'menunggu',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000005',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    facility_id: 'f0000000-0000-0000-0000-000000000006',
    category: 'Kursi/Meja',
    title: 'Papan Sandaran 3 Kursi Kuliah di Ruang TK-102 Retak',
    description: 'Tiga kursi kuliah beroda baris belakang di ruang TK-102 memiliki sandaran yang patah dan baut meja lepas, berbahaya saat diduduki.',
    photo_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    latitude: -7.05063,
    longitude: 110.43491,
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    facility_name: 'Ruang Kuliah Teori TK-102',
    facility_building: 'Gedung Dept. Teknik Komputer Lt. 1',
    user_name: 'Ahmad Zaidan (Mahasiswa Tekkom)',
    status: 'menunggu',
  },
];

// Global in-memory storage singleton
class LocalDataStore {
  private data: StoreData;

  constructor() {
    this.data = {
      users: [...INITIAL_USERS],
      facilities: [...INITIAL_FACILITIES],
      reports: [...INITIAL_REPORTS],
    };
  }

  // Users
  getUsers() {
    return this.data.users;
  }
  findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }
  addUser(user: StoreData['users'][0]) {
    this.data.users.push(user);
    return user;
  }
  setUserOtp(email: string, otp: string) {
    const user = this.findUserByEmail(email);
    if (!user || user.email_verified) return false;
    user.verification_otp = otp;
    user.otp_expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return true;
  }
  verifyUserOtp(email: string, otp: string) {
    const user = this.findUserByEmail(email);
    if (
      !user ||
      user.email_verified ||
      user.verification_otp !== otp ||
      !user.otp_expires_at ||
      new Date(user.otp_expires_at).getTime() <= Date.now()
    ) {
      return null;
    }
    user.email_verified = true;
    user.verification_otp = null;
    user.otp_expires_at = null;
    return user;
  }

  // Facilities
  getFacilities() {
    return this.data.facilities;
  }
  getFacilityById(id: string) {
    return this.data.facilities.find((f) => f.id === id);
  }

  // Reports
  getReports(query = '', category = '') {
    let list = [...this.data.reports];
    if (category && category !== 'Semua') {
      list = list.filter((r) => r.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.facility_name && r.facility_name.toLowerCase().includes(q))
      );
    }
    return list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  getReportsByUserId(userId: string) {
    return this.data.reports
      .filter((r) => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  getReportsByFacilityId(facilityId: string) {
    return this.data.reports
      .filter((r) => r.facility_id === facilityId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  getReportById(id: string) {
    return this.data.reports.find((r) => r.id === id);
  }
  addReport(report: Report & { user_id: string; facility_id: string }) {
    this.data.reports.unshift(report);
    return report;
  }
  updateReport(id: string, updates: Partial<Report>) {
    const idx = this.data.reports.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.reports[idx] = {
      ...this.data.reports[idx],
      ...updates,
    };
    return this.data.reports[idx];
  }
  updateReportFeedback(id: string, feedback: string, status: any, birokrasiUserId: string) {
    const idx = this.data.reports.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const birokrasiUser = this.findUserById(birokrasiUserId);
    this.data.reports[idx] = {
      ...this.data.reports[idx],
      feedback,
      status,
      feedback_by: birokrasiUserId,
      feedback_by_name: birokrasiUser ? birokrasiUser.name : 'Pihak Kampus',
      feedback_at: new Date().toISOString(),
    };
    return this.data.reports[idx];
  }
  deleteReport(id: string) {
    const idx = this.data.reports.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.data.reports.splice(idx, 1);
    return true;
  }
}

// Gunakan globalThis agar state tidak reset antar hot-reload server
const globalForStore = globalThis as unknown as {
  localDataStore?: LocalDataStore;
};

export const localStore = globalForStore.localDataStore || new LocalDataStore();
if (process.env.NODE_ENV !== 'production') globalForStore.localDataStore = localStore;
