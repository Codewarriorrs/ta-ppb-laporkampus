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
    name: 'Laboratorium Pemrograman & AI',
    building: 'Gedung Elektro Lt. 3',
    description: 'Laboratorium komputer dengan 40 unit PC untuk praktikum pemrograman, kecerdasan buatan, dan multimedia.',
    image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    name: 'Perpustakaan Pusat Kampus',
    building: 'Gedung Rektorat Lt. 2',
    description: 'Pusat referensi buku, jurnal internasional, ruang belajar tenang, dan ruang diskusi mahasiswa.',
    image_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    name: 'Ruang Kuliah 204 (GKB)',
    building: 'Gedung Kuliah Bersama Lt. 2',
    description: 'Ruang kelas berkapasitas 60 mahasiswa dengan proyektor ganda, pendingin ruangan, dan papan tulis elektrik.',
    image_url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    name: 'Toilet Pria & Wanita Lt. 1 GKB',
    building: 'Gedung Kuliah Bersama Lt. 1',
    description: 'Fasilitas sanitasi utama lantai dasar dengan 6 bilik toilet, wastafel otomatis, dan cermin.',
    image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    name: 'Kantin Utama Kampus',
    building: 'Pusat Kegiatan Mahasiswa (PKM)',
    description: 'Area pujasera kampus berkapasitas 200 kursi menyediakan berbagai hidangan makanan dan minuman higienis.',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000006',
    name: 'Masjid Al-Hikmah Kampus',
    building: 'Kompleks Pusat Ibadah',
    description: 'Masjid utama kampus dengan kapasitas 500 jamaah, berpendingin AC, area wudhu luas, dan sound system modern.',
    image_url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000007',
    name: 'Auditorium Utama & Ruang Seminar',
    building: 'Gedung Serbaguna Lt. 1',
    description: 'Ruang pertemuan berkapasitas 300 orang untuk seminar nasional, kuliah umum, dan kegiatan kemahasiswaan.',
    image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000008',
    name: 'Laboratorium Jaringan & IoT',
    building: 'Gedung Informatika Lt. 2',
    description: 'Laboratorium praktikum jaringan komputer, perangkat switch/router Cisco, dan instrumen sensor IoT.',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000009',
    name: 'Lapangan Futsal & Olahraga',
    building: 'Kompleks Olahraga Mahasiswa',
    description: 'Lapangan olahraga serbaguna dengan penerangan malam hari untuk futsal, basket, dan bola voli.',
    image_url: 'https://images.unsplash.com/photo-1529900241929-5ed53a431536?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000010',
    name: 'Ruang Kuliah 301 (Gedung B)',
    building: 'Gedung Teknik Sipil Lt. 3',
    description: 'Ruang kelas berkapasitas 50 kursi ergonomis, proyektor LCD, dan konektivitas WiFi edukasi.',
    image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

// Hash bcrypt untuk 'password123'
const DEFAULT_PASSWORD_HASH = '$2a$10$5M8pM4bV3sHj6gXmDqK8ce7LqK1G0fD7.aG0Zk1p6xZ9e2g3jK5h2';

const INITIAL_USERS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Ahmad Zaidan',
    email: 'zaidan@kampus.ac.id',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'mahasiswa' as const,
    email_verified: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Budi Santoso (Birokrasi Sarpras)',
    email: 'budi@kampus.ac.id',
    password_hash: DEFAULT_PASSWORD_HASH,
    role: 'birokrasi' as const,
    email_verified: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_REPORTS: Array<Report & { user_id: string; facility_id: string }> = [
  {
    id: 'r0000000-0000-0000-0000-000000000001',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    facility_id: 'f0000000-0000-0000-0000-000000000001',
    category: 'AC',
    title: 'AC di Lab Komputer Mati dan Mengeluarkan Bau Hangus',
    description: 'AC unit nomor 2 di sisi timur lab mati tiba-tiba saat praktikum berlangsung dan mengeluarkan sedikit bau asap. Mohon teknisi segera memeriksa.',
    photo_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    latitude: -7.05041,
    longitude: 110.43512,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    facility_name: 'Laboratorium Pemrograman & AI',
    facility_building: 'Gedung Elektro Lt. 3',
    user_name: 'Ahmad Zaidan',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000002',
    user_id: 'a0000000-0000-0000-0000-000000000002',
    facility_id: 'f0000000-0000-0000-0000-000000000003',
    category: 'Proyektor',
    title: 'Proyektor LCD Ruang 204 Berkedip dan Tampilan Kuning',
    description: 'Tampilan proyektor tidak stabil, warna layar menguning dan bergaris tebal sehingga presentasi kuliah sangat sulit dibaca.',
    photo_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    latitude: -7.05089,
    longitude: 110.43555,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    facility_name: 'Ruang Kuliah 204 (GKB)',
    facility_building: 'Gedung Kuliah Bersama Lt. 2',
    user_name: 'Budi Santoso',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000003',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    facility_id: 'f0000000-0000-0000-0000-000000000004',
    category: 'Toilet',
    title: 'Kran Wastafel Rusak dan Mengalirkan Air Terus',
    description: 'Kran wastafel ketiga di toilet pria tidak bisa ditutup rapat sehingga membuang air bersih dan membasahi lantai sekitarnya.',
    photo_url: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?auto=format&fit=crop&w=800&q=80',
    latitude: -7.05112,
    longitude: 110.43578,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    facility_name: 'Toilet Pria & Wanita Lt. 1 GKB',
    facility_building: 'Gedung Kuliah Bersama Lt. 1',
    user_name: 'Ahmad Zaidan',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000004',
    user_id: 'a0000000-0000-0000-0000-000000000002',
    facility_id: 'f0000000-0000-0000-0000-000000000002',
    category: 'Jaringan/WiFi',
    title: 'Koneksi Akses Poin WiFi di Meja Belajar Putus-Putus',
    description: 'Sinyal WiFi kampus (SSID: Edu-WiFi) di area pojok timur perpustakaan sering Request Time Out (RTO) dan tidak bisa login captive portal.',
    photo_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    latitude: -7.05063,
    longitude: 110.43491,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    facility_name: 'Perpustakaan Pusat Kampus',
    facility_building: 'Gedung Rektorat Lt. 2',
    user_name: 'Budi Santoso',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000005',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    facility_id: 'f0000000-0000-0000-0000-000000000008',
    category: 'Lampu',
    title: 'Lampu Neon Tengah Lab IoT Mati Total',
    description: '2 lampu tabung di tengah ruangan mati sehingga ruangan praktikum menjadi remang saat praktikum sore hari.',
    photo_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
    latitude: -7.05035,
    longitude: 110.43534,
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    facility_name: 'Laboratorium Jaringan & IoT',
    facility_building: 'Gedung Informatika Lt. 2',
    user_name: 'Ahmad Zaidan',
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
