// lib/kota.ts — Daftar kabupaten/kota + bandara di Sumatra Barat
export interface Kota {
  nama: string;
  type: "kabupaten" | "kota" | "bandara";
  jarakDariPadang: number; // km, perkiraan
  kode?: string; // kode bandara (PDG, dll)
}

export const DAFTAR_KOTA: Kota[] = [
  // Bandara ditaruh di atas supaya mudah ditemukan
  { nama: "Bandara Minangkabau (PDG)", type: "bandara", jarakDariPadang: 25, kode: "PDG" },

  // Kota
  { nama: "Padang", type: "kota", jarakDariPadang: 0 },
  { nama: "Bukittinggi", type: "kota", jarakDariPadang: 90 },
  { nama: "Padang Panjang", type: "kota", jarakDariPadang: 85 },
  { nama: "Payakumbuh", type: "kota", jarakDariPadang: 120 },
  { nama: "Pariaman", type: "kota", jarakDariPadang: 55 },
  { nama: "Sawahlunto", type: "kota", jarakDariPadang: 130 },
  { nama: "Solok", type: "kota", jarakDariPadang: 75 },

  // Kabupaten
  { nama: "Agam", type: "kabupaten", jarakDariPadang: 110 },
  { nama: "Dharmasraya", type: "kabupaten", jarakDariPadang: 180 },
  { nama: "Lima Puluh Kota", type: "kabupaten", jarakDariPadang: 130 },
  { nama: "Padang Pariaman", type: "kabupaten", jarakDariPadang: 60 },
  { nama: "Pasaman", type: "kabupaten", jarakDariPadang: 200 },
  { nama: "Pasaman Barat", type: "kabupaten", jarakDariPadang: 220 },
  { nama: "Pesisir Selatan", type: "kabupaten", jarakDariPadang: 150 },
  { nama: "Sijunjung", type: "kabupaten", jarakDariPadang: 160 },
  { nama: "Solok Selatan", type: "kabupaten", jarakDariPadang: 120 },
  { nama: "Tanah Datar", type: "kabupaten", jarakDariPadang: 100 },
];

// Cek apakah suatu nama adalah bandara
export function isBandara(nama: string): boolean {
  return DAFTAR_KOTA.find((k) => k.nama === nama)?.type === "bandara";
}

// Harga per km (Rp) — bisa di-adjust
export const HARGA_PER_KM = 1500;

// Hitung harga default berdasarkan jarak
export function hitungHarga(jarakKm: number): number {
  const raw = Math.max(jarakKm * HARGA_PER_KM, 50000);
  return Math.ceil(raw / 5000) * 5000;
}

// Estimasi jarak antar lokasi
export function jarakAntarLokasi(asal: string, tujuan: string): number {
  const a = DAFTAR_KOTA.find((k) => k.nama === asal);
  const b = DAFTAR_KOTA.find((k) => k.nama === tujuan);
  if (!a || !b) return 100;
  return Math.round(Math.abs(a.jarakDariPadang - b.jarakDariPadang) * 1.3);
}

// Estimasi waktu tempuh (menit)
export function estimasiWaktu(jarak: number): number {
  return Math.max(Math.round((jarak / 60) * 60), 30);
}
