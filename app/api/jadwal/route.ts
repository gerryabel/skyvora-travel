// app/api/jadwal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getArmadaGroup, listGroups } from "@/app/lib/armadaGroups";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const hari = searchParams.get("hari") || "";
    const asal = searchParams.get("asal") || "";
    const tujuan = searchParams.get("tujuan") || "";

    if (id) {
      const jadwal = await prisma.jadwal.findUnique({
        where: { id, aktif: true },
        include: { armada: true },
      });
      return NextResponse.json({ data: jadwal ? [jadwal] : [] });
    }

    const where: Record<string, any> = { aktif: true };
    if (hari) where.hari = hari;
    if (asal) where.asal = asal;
    if (tujuan) where.tujuan = tujuan;

    let armadaFilter: string[] | undefined;
    const groupParam = (searchParams.get("group") || "").trim().toUpperCase();
    if (groupParam) {
      const allowed = listGroups();
      const groups = groupParam.split(",").map(g => g.trim()).filter(g => allowed.includes(g as any));
      if (groups.length) {
        const allArmada = await prisma.armada.findMany({
          select: { id: true },
          where: { aktif: true },
        });
        armadaFilter = allArmada
          .filter(a => groups.includes(getArmadaGroup(a.id)))
          .map(a => a.id);
        if (armadaFilter.length) {
          where.armadaId = { in: armadaFilter };
        } else {
          where.armadaId = "00000000-00000000-00000000-00000000";
        }
      }
    }

    const jadwals = await prisma.jadwal.findMany({
      where,
      include: { armada: true },
      orderBy: [{ jamBerangkat: "asc" }],
    });

    const res = NextResponse.json({ data: jadwals });
    res.headers.set("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res;
  } catch (error) {
    console.error("Jadwal API error:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal" }, { status: 500 });
  }
}
