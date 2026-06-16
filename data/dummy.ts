// data/dummy.ts
// Data dummy untuk development sebelum integrasi database asli
// Sesuai preferensi: hardcode data dulu, pisahkan dari components

export interface Armada {
  id: string;
  nama: string;
  platNomor: string;
  tipe: string;
  kapasitas: number;
  foto: string;
  aktif: boolean;
}

export interface Jadwal {
  id: string;
  tipe: "ANTAR" | "JEMPUT";
  rute: string;
  asal: string;
  tujuan: string;
  bandara: string;
  harga: number;
  jamBerangkat: string;
  kapasitas: number;
  minKuota: number;
  terisi: number;
  estimasiWaktu: number;
  aktif: boolean;
  armadaId: string;
}

export interface Booking {
  id: string;
  userId: string;
  jadwalId: string;
  jumlahKursi: number;
  totalHarga: number;
  status: "PENDING" | "PAID" | "MENUNGGU_KUOTA" | "DIKONFIRMASI" | "BERANGKAT" | "SELESAI" | "DIBATALKAN";
  tipeTrip: "OPEN" | "PRIVATE";
  tglBerangkat: string;
  alamatJemput: string;
  catatan: string;
  kodePenerbangan: string;
  jamBoarding: string;
  jamLanding: string;
  createdAt: string;
}

// =============================================
// DUMMY DATA
// =============================================

export const dummyArmada: Armada[] = [
  {
    id: "armada-1",
    nama: "Toyota Innova",
    platNomor: "B 1234 XX",
    tipe: "MPV",
    kapasitas: 6,
    foto: "/armada/innova.jpg",
    aktif: true,
  },
  {
    id: "armada-2",
    nama: "Daihatsu Xenia",
    platNomor: "B 5678 YY",
    tipe: "MPV",
    kapasitas: 6,
    foto: "/armada/xenia.jpg",
    aktif: true,
  },
  {
    id: "armada-3",
    nama: "Toyota Avanza",
    platNomor: "B 9012 ZZ",
    tipe: "MPV",
    kapasitas: 7,
    foto: "/armada/avanza.jpg",
    aktif: true,
  },
];

export const dummyJadwal: Jadwal[] = [
  // ANTAR: Rumah → Bandara
  {
    id: "jadwal-1",
    tipe: "ANTAR",
    rute: "Bukittinggi → Bandara Soetta",
    asal: "Bukittinggi",
    tujuan: "Bandara Internasional Soekarno-Hatta",
    bandara: "Soekarno-Hatta (CGK)",
    harga: 150000,
    jamBerangkat: "05:00",
    kapasitas: 6,
    minKuota: 2,
    terisi: 2,
    estimasiWaktu: 120,
    aktif: true,
    armadaId: "armada-1",
  },
  {
    id: "jadwal-2",
    tipe: "ANTAR",
    rute: "Padang → Bandara Soetta",
    asal: "Padang",
    tujuan: "Bandara Internasional Soekarno-Hatta",
    bandara: "Soekarno-Hatta (CGK)",
    harga: 175000,
    jamBerangkat: "04:30",
    kapasitas: 6,
    minKuota: 2,
    terisi: 1,
    estimasiWaktu: 150,
    aktif: true,
    armadaId: "armada-2",
  },
  {
    id: "jadwal-3",
    tipe: "ANTAR",
    rute: "Bandung → Bandara Soetta",
    asal: "Bandung",
    tujuan: "Bandara Internasional Soekarno-Hatta",
    bandara: "Soekarno-Hatta (CGK)",
    harga: 100000,
    jamBerangkat: "06:00",
    kapasitas: 7,
    minKuota: 2,
    terisi: 4,
    estimasiWaktu: 60,
    aktif: true,
    armadaId: "armada-3",
  },
  // JEMPUT: Bandara → Rumah
  {
    id: "jadwal-4",
    tipe: "JEMPUT",
    rute: "Bandara Soetta → Bukittinggi",
    asal: "Bandara Internasional Soekarno-Hatta",
    tujuan: "Bukittinggi",
    bandara: "Soekarno-Hatta (CGK)",
    harga: 150000,
    jamBerangkat: "Fleksibel",
    kapasitas: 6,
    minKuota: 2,
    terisi: 1,
    estimasiWaktu: 120,
    aktif: true,
    armadaId: "armada-1",
  },
  {
    id: "jadwal-5",
    tipe: "JEMPUT",
    rute: "Bandara Soetta → Padang",
    asal: "Bandara Internasional Soekarno-Hatta",
    tujuan: "Padang",
    bandara: "Soekarno-Hatta (CGK)",
    harga: 175000,
    jamBerangkat: "Fleksibel",
    kapasitas: 6,
    minKuota: 2,
    terisi: 0,
    estimasiWaktu: 150,
    aktif: true,
    armadaId: "armada-2",
  },
  {
    id: "jadwal-6",
    tipe: "JEMPUT",
    rute: "Bandara Juanda → Malang",
    asal: "Bandara Internasional Juanda",
    tujuan: "Malang",
    bandara: "Juanda (SUB)",
    harga: 120000,
    jamBerangkat: "Fleksibel",
    kapasitas: 7,
    minKuota: 2,
    terisi: 3,
    estimasiWaktu: 90,
    aktif: true,
    armadaId: "armada-3",
  },
];

export const dummyBooking: Booking[] = [
  {
    id: "booking-1",
    userId: "user-1",
    jadwalId: "jadwal-1",
    jumlahKursi: 2,
    totalHarga: 300000,
    status: "DIKONFIRMASI",
    tipeTrip: "OPEN",
    tglBerangkat: "2026-06-15",
    alamatJemput: "Jl. Sudirman No. 10, Bukittinggi",
    catatan: "Tolong jemput tepat waktu, penerbangan pagi",
    kodePenerbangan: "JT100",
    jamBoarding: "08:00",
    jamLanding: "",
    createdAt: "2026-06-11T10:00:00Z",
  },
  {
    id: "booking-2",
    userId: "user-1",
    jadwalId: "jadwal-4",
    jumlahKursi: 1,
    totalHarga: 150000,
    status: "MENUNGGU_KUOTA",
    tipeTrip: "OPEN",
    tglBerangkat: "2026-06-16",
    alamatJemput: "Jl. Ahmad Yani No. 5, Bukittinggi",
    catatan: "",
    kodePenerbangan: "GA200",
    jamBoarding: "",
    jamLanding: "14:30",
    createdAt: "2026-06-11T12:00:00Z",
  },
];

// =============================================
// HELPER FUNCTIONS
// =============================================

export function getJadwalById(id: string): Jadwal | undefined {
  return dummyJadwal.find((j) => j.id === id);
}

export function getArmadaById(id: string): Armada | undefined {
  return dummyArmada.find((a) => a.id === id);
}

export function getJadwalByTipe(tipe: "ANTAR" | "JEMPUT"): Jadwal[] {
  return dummyJadwal.filter((j) => j.tipe === tipe && j.aktif);
}

export function searchJadwal(
  tipe: "ANTAR" | "JEMPUT",
  asal: string,
  tujuan: string,
  tanggal: string
): Jadwal[] {
  return dummyJadwal.filter(
    (j) =>
      j.tipe === tipe &&
      j.aktif &&
      j.asal.toLowerCase().includes(asal.toLowerCase()) &&
      j.tujuan.toLowerCase().includes(tujuan.toLowerCase())
  );
}

export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

export function formatWaktu(menit: number): string {
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  if (jam === 0) return `${sisa} menit`;
  if (sisa === 0) return `${jam} jam`;
  return `${jam} jam ${sisa} menit`;
}

export function hitungJamJemput(
  jamBoarding: string,
  estimasiWaktu: number
): string {
  // jamBoarding format: "HH:MM"
  const [h, m] = jamBoarding.split(":").map(Number);
  const totalMenit = h * 60 + m - 90 - estimasiWaktu; // 90 menit sebelum boarding
  const jam = Math.floor(totalMenit / 60) % 24;
  const menit = totalMenit % 60;
  return `${String(jam).padStart(2, "0")}:${String(menit).padStart(2, "0")}`;
}

export function hitungJamJemputBandara(
  jamLanding: string
): string {
  // jamLanding format: "HH:MM"
  const [h, m] = jamLanding.split(":").map(Number);
  const totalMenit = h * 60 + m + 30 + 15; // 30 menit ambil bagasi + 15 menit buffer
  const jam = Math.floor(totalMenit / 60) % 24;
  const menit = totalMenit % 60;
  return `${String(jam).padStart(2, "0")}:${String(menit).padStart(2, "0")}`;
}
