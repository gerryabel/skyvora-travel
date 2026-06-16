// app/api/admin/dashboard/pendapatan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periode = searchParams.get("periode") || "hari"; // hari | bulan | tahun

    const now = new Date();
    const tahun = now.getFullYear();

    if (periode === "hari") {
      // Pendapatan per hari (7 hari terakhir)
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const bookings = await prisma.booking.findMany({
        where: {
          status: { in: ["DIKONFIRMASI", "SELESAI", "BERANGKAT"] },
          createdAt: { gte: startDate },
        },
        select: { totalHarga: true, createdAt: true },
      });

      // Group by day
      const days: Record<string, number> = {};
      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = `${dayNames[d.getDay()]}, ${d.getDate()}`;
        days[key] = 0;
      }

      bookings.forEach(b => {
        const d = new Date(b.createdAt);
        const key = `${dayNames[d.getDay()]}, ${d.getDate()}`;
        if (key in days) days[key] += b.totalHarga;
      });

      const data = Object.entries(days).map(([name, pendapatan]) => ({ name, pendapatan }));
      return NextResponse.json({ data });
    }

    if (periode === "bulan") {
      // Pendapatan per bulan (12 bulan)
      const bookings = await prisma.booking.findMany({
        where: {
          status: { in: ["DIKONFIRMASI", "SELESAI", "BERANGKAT"] },
          createdAt: {
            gte: new Date(tahun, 0, 1),
            lt: new Date(tahun + 1, 0, 1),
          },
        },
        select: { totalHarga: true, createdAt: true },
      });

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const months: Record<string, number> = {};
      monthNames.forEach(m => { months[m] = 0; });

      bookings.forEach(b => {
        const d = new Date(b.createdAt);
        const key = monthNames[d.getMonth()];
        months[key] += b.totalHarga;
      });

      const data = Object.entries(months).map(([name, pendapatan]) => ({ name, pendapatan }));
      return NextResponse.json({ data });
    }

    if (periode === "tahun") {
      // Pendapatan per tahun (5 tahun terakhir)
      const startYear = tahun - 4;
      const bookings = await prisma.booking.findMany({
        where: {
          status: { in: ["DIKONFIRMASI", "SELESAI", "BERANGKAT"] },
          createdAt: {
            gte: new Date(startYear, 0, 1),
            lt: new Date(tahun + 1, 0, 1),
          },
        },
        select: { totalHarga: true, createdAt: true },
      });

      const years: Record<string, number> = {};
      for (let y = startYear; y <= tahun; y++) {
        years[String(y)] = 0;
      }

      bookings.forEach(b => {
        const y = String(new Date(b.createdAt).getFullYear());
        if (y in years) years[y] += b.totalHarga;
      });

      const data = Object.entries(years).map(([name, pendapatan]) => ({ name, pendapatan }));
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Periode tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Pendapatan API error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pendapatan" }, { status: 500 });
  }
}
