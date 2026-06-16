// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// =============================================
// KONFIGURASI RUTE & HARGA
// =============================================

// Daftara kota + bandara yang dilayani
// Format: [nama, jarakDariPadang (km)]
const KOTA_LIST: [string, number][] = [
  ["Bandara Minangkabau (PDG)", 25],
  ["Padang", 0],
  ["Bukittinggi", 90],
  ["Padang Panjang", 85],
  ["Payakumbuh", 120],
  ["Pariaman", 55],
  ["Sawahlunto", 130],
  ["Solok", 75],
  ["Agam", 110],
  ["Dharmasraya", 180],
  ["Lima Puluh Kota", 130],
  ["Padang Pariaman", 60],
  ["Pasaman", 200],
  ["Pasaman Barat", 220],
  ["Pesisir Selatan", 150],
  ["Sijunjung", 160],
  ["Solok Selatan", 120],
  ["Tanah Datar", 100],
];

// Harga berdasarkan jarak: Rp 1.500/km, min 50.000, bulatan 5.000
function hargaDariJarak(jarak: number): number {
  const raw = Math.max(jarak * 1500, 50000);
  return Math.ceil(raw / 5000) * 5000;
}

// Estimasi jarak antar kota (via faktor 1.3 dari selisih jarak Padang)
function jarakAntarKota(asal: string, tujuan: string): number {
  const a = KOTA_LIST.find((k) => k[0] === asal);
  const b = KOTA_LIST.find((k) => k[0] === tujuan);
  if (!a || !b) return 100;
  return Math.round(Math.abs(a[1] - b[1]) * 1.3);
}

// Estimasi waktu tempuh (menit) — asumsi rata-rata 60 km/jam
function estimasiWaktu(jarak: number): number {
  return Math.max(Math.round((jarak / 60) * 60), 30);
}

const HARI_LIST = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"] as const;

// Rute utama yang di-seed: dari/ke Padang sebagai hub + beberapa rute langsung
// Format: [asal, tujuan, jamList]
const RUTE_CONFIG: [string, string, string[]][] = [
  // Dari Padang ke kota lain
  ["Padang", "Bukittinggi", ["06:00", "09:00", "13:00", "17:00"]],
  ["Padang", "Agam", ["07:00", "12:00", "16:00"]],
  ["Padang", "Tanah Datar", ["08:00", "14:00"]],
  ["Padang", "Solok", ["07:30", "13:30"]],
  ["Padang", "Padang Pariaman", ["06:30", "10:00", "15:00"]],
  ["Padang", "Pariaman", ["08:00", "14:00", "18:00"]],
  ["Padang", "Payakumbuh", ["07:00", "15:00"]],
  ["Padang", "Lima Puluh Kota", ["08:30", "16:00"]],
  ["Padang", "Sawahlunto", ["09:00", "15:00"]],
  ["Padang", "Sijunjung", ["07:00", "14:00"]],
  ["Padang", "Pesisir Selatan", ["06:00", "12:00"]],
  ["Padang", "Dharmasraya", ["08:00"]],
  ["Padang", "Pasaman", ["07:00", "13:00"]],
  ["Padang", "Pasaman Barat", ["08:00"]],
  ["Padang", "Solok Selatan", ["09:00"]],
  // Balik ke Padang
  ["Bukittinggi", "Padang", ["08:00", "12:00", "16:00", "20:00"]],
  ["Agam", "Padang", ["09:00", "14:00", "18:00"]],
  ["Tanah Datar", "Padang", ["10:00", "16:00"]],
  ["Solok", "Padang", ["09:30", "15:30"]],
  ["Padang Pariaman", "Padang", ["08:30", "12:00", "17:00"]],
  ["Pariaman", "Padang", ["10:00", "16:00", "20:00"]],
  ["Payakumbuh", "Padang", ["09:00", "17:00"]],
  ["Lima Puluh Kota", "Padang", ["10:30", "18:00"]],
  ["Sawahlunto", "Padang", ["11:00", "17:00"]],
  ["Sijunjung", "Padang", ["09:00", "16:00"]],
  ["Pesisir Selatan", "Padang", ["08:00", "14:00"]],
  ["Dharmasraya", "Padang", ["10:00"]],
  ["Pasaman", "Padang", ["09:00", "15:00"]],
  ["Pasaman Barat", "Padang", ["10:00"]],
  ["Solok Selatan", "Padang", ["11:00"]],
  // Rute langsung antar kota besar (tanpa via Padang)
  ["Bukittinggi", "Agam", ["09:00", "15:00"]],
  ["Agam", "Bukittinggi", ["10:00", "16:00"]],
  ["Bukittinggi", "Tanah Datar", ["08:00", "14:00"]],
  ["Tanah Datar", "Bukittinggi", ["10:00", "16:00"]],
  ["Bukittinggi", "Payakumbuh", ["09:00", "17:00"]],
  ["Payakumbuh", "Bukittinggi", ["10:00", "18:00"]],
  ["Solok", "Bukittinggi", ["08:00", "15:00"]],
  ["Bukittinggi", "Solok", ["10:00", "17:00"]],
  ["Padang Panjang", "Bukittinggi", ["07:30", "13:30", "18:00"]],
  ["Bukittinggi", "Padang Panjang", ["09:00", "15:00", "19:00"]],
  // Antar kota via Padang Panjang
  ["Padang Panjang", "Padang", ["08:30", "13:30", "18:30"]],

  // === RUTE KE/DARI BANDARA MINANGKABAU (PDG) ===
  // Kota → Bandara (ANTAR)
  ["Padang", "Bandara Minangkabau (PDG)", ["05:00", "07:00", "09:00", "12:00", "15:00", "18:00"]],
  ["Bukittinggi", "Bandara Minangkabau (PDG)", ["05:00", "08:00", "12:00", "16:00"]],
  ["Agam", "Bandara Minangkabau (PDG)", ["06:00", "10:00", "14:00"]],
  ["Tanah Datar", "Bandara Minangkabau (PDG)", ["06:30", "11:00", "15:00"]],
  ["Solok", "Bandara Minangkabau (PDG)", ["05:30", "09:00", "14:00"]],
  ["Padang Pariaman", "Bandara Minangkabau (PDG)", ["05:00", "08:00", "12:00", "16:00"]],
  ["Pariaman", "Bandara Minangkabau (PDG)", ["06:00", "10:00", "15:00"]],
  ["Payakumbuh", "Bandara Minangkabau (PDG)", ["05:00", "10:00", "15:00"]],
  ["Lima Puluh Kota", "Bandara Minangkabau (PDG)", ["06:00", "11:00"]],
  ["Sawahlunto", "Bandara Minangkabau (PDG)", ["07:00", "12:00"]],
  ["Sijunjung", "Bandara Minangkabau (PDG)", ["05:30", "10:00"]],
  ["Pesisir Selatan", "Bandara Minangkabau (PDG)", ["05:00", "09:00"]],
  ["Dharmasraya", "Bandara Minangkabau (PDG)", ["06:00", "11:00"]],
  ["Pasaman", "Bandara Minangkabau (PDG)", ["05:00", "10:00"]],
  ["Pasaman Barat", "Bandara Minangkabau (PDG)", ["06:00"]],
  ["Solok Selatan", "Bandara Minangkabau (PDG)", ["07:00"]],
  ["Padang Panjang", "Bandara Minangkabau (PDG)", ["05:30", "09:00", "14:00"]],
  // Bandara → Kota (JEMPUT)
  ["Bandara Minangkabau (PDG)", "Padang", ["07:00", "09:00", "11:00", "14:00", "17:00", "20:00"]],
  ["Bandara Minangkabau (PDG)", "Bukittinggi", ["08:00", "12:00", "16:00", "20:00"]],
  ["Bandara Minangkabau (PDG)", "Agam", ["09:00", "13:00", "17:00"]],
  ["Bandara Minangkabau (PDG)", "Tanah Datar", ["09:30", "14:00", "18:00"]],
  ["Bandara Minangkabau (PDG)", "Solok", ["08:30", "12:00", "17:00"]],
  ["Bandara Minangkabau (PDG)", "Padang Pariaman", ["07:00", "10:00", "14:00", "18:00"]],
  ["Bandara Minangkabau (PDG)", "Pariaman", ["09:00", "13:00", "18:00"]],
  ["Bandara Minangkabau (PDG)", "Payakumbuh", ["08:00", "13:00", "18:00"]],
  ["Bandara Minangkabau (PDG)", "Lima Puluh Kota", ["09:00", "15:00"]],
  ["Bandara Minangkabau (PDG)", "Sawahlunto", ["10:00", "15:00"]],
  ["Bandara Minangkabau (PDG)", "Sijunjung", ["08:00", "13:00"]],
  ["Bandara Minangkabau (PDG)", "Pesisir Selatan", ["07:00", "12:00"]],
  ["Bandara Minangkabau (PDG)", "Dharmasraya", ["09:00"]],
  ["Bandara Minangkabau (PDG)", "Pasaman", ["07:00", "13:00"]],
  ["Bandara Minangkabau (PDG)", "Pasaman Barat", ["09:00"]],
  ["Bandara Minangkabau (PDG)", "Solok Selatan", ["10:00"]],
  ["Bandara Minangkabau (PDG)", "Padang Panjang", ["08:00", "12:00", "17:00"]],
];

// Armada assignment berdasarkan kapasitas rute
function pilihArmada(jarak: number): { armadaId: string; kapasitas: number } {
  if (jarak > 150) return { armadaId: "armada-1", kapasitas: 6 }; // Minibus untuk jauh
  if (jarak > 80) return { armadaId: "armada-2", kapasitas: 4 };  // MPV sedang
  return { armadaId: "armada-3", kapasitas: 4 };                  // MPV dekat
}

async function main() {
  console.log("Seeding database...");

  // CLEANUP
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.jadwal.deleteMany({});
  await prisma.armada.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("  Cleaned old data");

  // ARMADAS
  await prisma.armada.upsert({ where: { id: "armada-1" }, update: {}, create: { id: "armada-1", nama: "Toyota HiAce", platNomor: "BA 1234 XX", kapasitas: 6, tipe: "MINIBUS", aktif: true, status: "STANDBY" } });
  await prisma.armada.upsert({ where: { id: "armada-2" }, update: {}, create: { id: "armada-2", nama: "Daihatsu Xenia", platNomor: "BA 5678 YY", kapasitas: 4, tipe: "MPV", aktif: true, status: "STANDBY" } });
  await prisma.armada.upsert({ where: { id: "armada-3" }, update: {}, create: { id: "armada-3", nama: "Suzuki Ertiga", platNomor: "BA 9012 ZZ", kapasitas: 4, tipe: "MPV", aktif: true, status: "STANDBY" } });
  console.log("  Armadas: 3");

  // USERS
  const bcrypt = await import("bcryptjs");
  const hp = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({ where: { email: "admin@skyvoratravel.com" }, update: {}, create: { id: "user-1", name: "Admin Skyvora", email: "admin@skyvoratravel.com", password: hp, phone: "081266291189", role: "ADMIN" } });
  await prisma.user.upsert({ where: { email: "abelgerry11@gmail.com" }, update: {}, create: { id: "user-2", name: "Gerry Skyvora", email: "abelgerry11@gmail.com", password: hp, phone: "081266291189", role: "USER" } });
  console.log("  Users: 2");

  // JADWAL — generate per hari dari RUTE_CONFIG
  let jadwalCount = 0;
  for (const hari of HARI_LIST) {
    for (const [asal, tujuan, jamList] of RUTE_CONFIG) {
      const jarak = jarakAntarKota(asal, tujuan);
      const harga = hargaDariJarak(jarak);
      const estimasi = estimasiWaktu(jarak);
      const { armadaId, kapasitas } = pilihArmada(jarak);
      const isBandaraTujuan = tujuan.includes("Bandara");
      const isBandaraAsal = asal.includes("Bandara");
      const tipe = isBandaraTujuan ? "ANTAR" : isBandaraAsal ? "JEMPUT" : "ANTAR";
      const rute = `${asal} → ${tujuan}`;

      for (let i = 0; i < jamList.length; i++) {
        const jam = jamList[i];
        const id = `jadwal-${hari.toLowerCase()}-${asal.toLowerCase().replace(/\\s/g, "")}-${tujuan.toLowerCase().replace(/\\s/g, "")}-${i + 1}`;

        await prisma.jadwal.upsert({
          where: { id },
          update: {},
          create: {
            id,
            tipe,
            rute,
            asal,
            tujuan,
            bandara: "",
            hari,
            jamBerangkat: jam,
            harga,
            kapasitas,
            estimasiWaktu: estimasi,
            armadaId,
            terisi: 0,
            minKuota: 1,
            aktif: true,
          },
        });
        jadwalCount++;
      }
    }
  }
  console.log(`  Jadwals: ${jadwalCount}`);

  // BOOKING sample
  const today = new Date().toISOString().split("T")[0];
  await prisma.booking.upsert({ where: { id: "booking-1" }, update: {}, create: { id: "booking-1", userId: "user-2", jadwalId: "jadwal-senin-padang-bukittinggi-1", tipeTrip: "OPEN", status: "DIKONFIRMASI", jumlahKursi: 1, totalHarga: 135000, tglBerangkat: today, alamatJemput: "Jl. Sudirman No. 10, Padang" } });
  await prisma.booking.upsert({ where: { id: "booking-2" }, update: {}, create: { id: "booking-2", userId: "user-2", jadwalId: "jadwal-senin-padang-agam-1", tipeTrip: "OPEN", status: "MENUNGGU_KUOTA", jumlahKursi: 2, totalHarga: 330000, tglBerangkat: today, alamatJemput: "Jl. Ahmad Yani No. 5, Padang" } });
  await prisma.booking.upsert({ where: { id: "booking-3" }, update: {}, create: { id: "booking-3", userId: "user-2", jadwalId: "jadwal-senin-bukittinggi-padang-1", tipeTrip: "PRIVATE", status: "SELESAI", jumlahKursi: 4, totalHarga: 540000, tglBerangkat: today, alamatJemput: "Jl. Diponegoro No. 20, Bukittinggi" } });
  console.log("  Bookings: 3");

  console.log("");
  console.log("Database seeded successfully!");
  console.log("  Admin: admin@skyvoratravel.com / password123");
  console.log("  User:  abelgerry11@gmail.com / password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
