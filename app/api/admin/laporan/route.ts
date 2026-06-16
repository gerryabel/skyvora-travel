// app/api/admin/laporan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPrismaClient } from "../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const prisma = createPrismaClient();
    const { searchParams } = new URL(req.url);
    const periode = searchParams.get("periode") || "bulanan"; // harian, bulanan, tahunan
    const tanggal = searchParams.get("tanggal") || new Date().toISOString().slice(0, 10);

    const tgl = new Date(tanggal);
    let startDate: Date;
    let endDate: Date;
    let groupBy: "day" | "month" = "day";

    if (periode === "harian") {
      // Laporan per jam dalam 1 hari
      startDate = new Date(tgl);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(tgl);
      endDate.setHours(23, 59, 59, 999);
      groupBy = "day";
    } else if (periode === "bulanan") {
      // Laporan per hari dalam 1 bulan
      startDate = new Date(tgl.getFullYear(), tgl.getMonth(), 1);
      endDate = new Date(tgl.getFullYear(), tgl.getMonth() + 1, 0, 23, 59, 59, 999);
      groupBy = "day";
    } else {
      // Laporan per bulan dalam 1 tahun
      startDate = new Date(tgl.getFullYear(), 0, 1);
      endDate = new Date(tgl.getFullYear(), 11, 31, 23, 59, 59, 999);
      groupBy = "month";
    }

    // Ambil semua booking yang punya pendapatan dalam range
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["PAID", "DIKONFIRMASI", "SELESAI", "BERANGKAT"] },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        jadwal: { select: { rute: true, tipe: true } },
        payment: { select: { method: true, paidAt: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Summary
    const totalPendapatan = bookings.reduce((sum, b) => sum + b.totalHarga, 0);
    const totalBooking = bookings.length;
    const totalKursi = bookings.reduce((sum, b) => sum + b.jumlahKursi, 0);
    const rataRataPerBooking = totalBooking > 0 ? Math.round(totalPendapatan / totalBooking) : 0;

    // Group by periode
    const chartData: { label: string; pendapatan: number; booking: number }[] = [];

    if (periode === "harian") {
      // Group per jam
      const jamMap = new Map<string, { pendapatan: number; booking: number }>();
      for (let h = 0; h < 24; h++) {
        const key = `${h.toString().padStart(2, "0")}:00`;
        jamMap.set(key, { pendapatan: 0, booking: 0 });
      }
      bookings.forEach((b) => {
        const jam = new Date(b.createdAt).getHours();
        const key = `${jam.toString().padStart(2, "0")}:00`;
        const entry = jamMap.get(key)!;
        entry.pendapatan += b.totalHarga;
        entry.booking += 1;
      });
      jamMap.forEach((v, k) => {
        if (v.booking > 0) chartData.push({ label: k, ...v });
      });
    } else if (periode === "bulanan") {
      // Group per hari — tampilkan SEMUA hari di bulan, meski 0
      const daysInMonth = new Date(tgl.getFullYear(), tgl.getMonth() + 1, 0).getDate();
      const hariMap = new Map<string, { pendapatan: number; booking: number }>();
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${tgl.getFullYear()}-${(tgl.getMonth() + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
        hariMap.set(key, { pendapatan: 0, booking: 0 });
      }
      bookings.forEach((b) => {
        const d = new Date(b.createdAt);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
        if (!hariMap.has(key)) hariMap.set(key, { pendapatan: 0, booking: 0 });
        const entry = hariMap.get(key)!;
        entry.pendapatan += b.totalHarga;
        entry.booking += 1;
      });
      hariMap.forEach((v, k) => chartData.push({ label: k, ...v }));
    } else {
      // Group per bulan — tampilkan SEMUA 12 bulan, meski 0
      const bulanMap = new Map<string, { pendapatan: number; booking: number }>();
      const bulanLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      for (let m = 1; m <= 12; m++) {
        const key = `${tgl.getFullYear()}-${m.toString().padStart(2, "0")}`;
        bulanMap.set(key, { pendapatan: 0, booking: 0 });
      }
      bookings.forEach((b) => {
        const d = new Date(b.createdAt);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        if (!bulanMap.has(key)) bulanMap.set(key, { pendapatan: 0, booking: 0 });
        const entry = bulanMap.get(key)!;
        entry.pendapatan += b.totalHarga;
        entry.booking += 1;
      });
      bulanMap.forEach((v, k) => {
        const monthIdx = parseInt(k.split("-")[1]) - 1;
        chartData.push({ label: `${bulanLabels[monthIdx]} ${k.split("-")[0]}`, ...v });
      });
    }

    // Breakdown by tipe (ANTAR/JEMPUT)
    const tipeBreakdown: { tipe: string; pendapatan: number; booking: number }[] = [];
    const tipeMap = new Map<string, { pendapatan: number; booking: number }>();
    bookings.forEach((b) => {
      const tipe = b.jadwal?.tipe || "UNKNOWN";
      if (!tipeMap.has(tipe)) tipeMap.set(tipe, { pendapatan: 0, booking: 0 });
      const entry = tipeMap.get(tipe)!;
      entry.pendapatan += b.totalHarga;
      entry.booking += 1;
    });
    tipeMap.forEach((v, k) => tipeBreakdown.push({ tipe: k, ...v }));

    // Breakdown by metode pembayaran
    const metodeBreakdown: { metode: string; pendapatan: number; booking: number }[] = [];
    const metodeMap = new Map<string, { pendapatan: number; booking: number }>();
    bookings.forEach((b) => {
      const metode = b.metodePembayaran || b.payment?.method || "Lainnya";
      if (!metodeMap.has(metode)) metodeMap.set(metode, { pendapatan: 0, booking: 0 });
      const entry = metodeMap.get(metode)!;
      entry.pendapatan += b.totalHarga;
      entry.booking += 1;
    });
    metodeMap.forEach((v, k) => metodeBreakdown.push({ metode: k, ...v }));

    return NextResponse.json({
      periode,
      tanggal,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        totalPendapatan,
        totalBooking,
        totalKursi,
        rataRataPerBooking,
      },
      chartData,
      tipeBreakdown,
      metodeBreakdown,
      bookings: bookings.map((b) => ({
        id: b.id,
        user: b.user?.name || "-",
        rute: b.jadwal?.rute || "-",
        tipe: b.jadwal?.tipe || "-",
        jumlahKursi: b.jumlahKursi,
        totalHarga: b.totalHarga,
        metodePembayaran: b.metodePembayaran || b.payment?.method || "-",
        status: b.status,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("Laporan error:", error);
    return NextResponse.json({ error: "Gagal memuat laporan" }, { status: 500 });
  }
}
