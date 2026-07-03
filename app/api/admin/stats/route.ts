// app/api/admin/stats/route.ts
import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import { prisma } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.success) return guard.response;
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
