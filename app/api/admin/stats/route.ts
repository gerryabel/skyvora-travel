// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const [totalBooking, totalJadwal, totalArmada, bookingByStatus] = await Promise.all([
      prisma.booking.count(),
      prisma.jadwal.count({ where: { aktif: true } }),
      prisma.armada.count({ where: { aktif: true } }),
      prisma.booking.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const b of bookingByStatus) {
      statusCounts[b.status] = b._count.status;
    }

    return NextResponse.json({
      totalBooking,
      totalJadwal,
      totalArmada,
      statusCounts,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
