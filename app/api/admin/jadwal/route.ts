// app/api/admin/jadwal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import { prisma } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.success) return guard.response;
    const jadwals = await prisma.jadwal.findMany({
      where: {},
      include: { armada: true },
      orderBy: [
        { hari: "asc" },
        { jamBerangkat: "asc" },
      ],
    });
    const res = NextResponse.json({ data: jadwals });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error) {
    console.error("Admin jadwal GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal" }, { status: 500 });
  }
}

// POST dihapus — jadwal hanya di-seed, admin tidak bisa tambah manual
