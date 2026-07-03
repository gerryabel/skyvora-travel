"use server";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import { prisma } from "@/app/lib/db";
import { getArmadaGroup, listGroups } from "@/app/lib/armadaGroups";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.success) return guard.response;

    const armadas = await prisma.armada.findMany({
      where: { aktif: true },
      include: {
        _count: { select: { jadwals: true } },
      },
      orderBy: { nama: "asc" },
    });

    const groups = listGroups();
    const map = new Map<string, any[]>();
    for (const g of groups) map.set(g, []);

    for (const a of armadas) {
      const group = getArmadaGroup(a.id);
      map.set(
        group,
        (map.get(group) || []).concat({
          id: a.id,
          nama: a.nama,
          platNomor: a.platNomor,
          kapasitas: a.kapasitas,
          jadwalCount: a._count.jadwals,
          group,
        })
      );
    }

    const payload = groups.map((g) => ({
      group: g,
      armada: map.get(g) || [],
      armadaCount: (map.get(g) || []).length,
      totalJadwal: (map.get(g) || []).reduce((c, v) => c + v.jadwalCount, 0),
    }));

    return NextResponse.json({
      data: payload,
      summary: {
        totalArmada: armadas.length,
        totalJadwal: payload.reduce((c, g) => c + g.totalJadwal, 0),
      },
    });
  } catch (err: any) {
    console.error("Admin armada groups error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
