// app/api/admin/armada/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import { prisma } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.success) return guard.response;
    const armadas = await prisma.armada.findMany({
      include: {
        _count: { select: { jadwals: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    // Map to include returnAt
    const result = armadas.map(a => ({
      ...a,
      returnAt: a.returnAt?.toISOString() || null,
    }));
    const res = NextResponse.json({ data: result });
    res.headers.set("Cache-Control", "s-maxage=10, stale-while-revalidate=30");
    return res;
  } catch (error) {
    console.error("Admin armada GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data armada" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.success) return guard.response;
    const raw = await req.text();
    if (raw.length > 2048) {
      return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
    }
    const body = JSON.parse(raw);
    const { nama, platNomor, kapasitas, tipe, status, aktif } = body;

    if (!nama || !platNomor || !kapasitas) {
      return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    const armada = await prisma.armada.create({
      data: {
        nama,
        platNomor,
        kapasitas: Number(kapasitas),
        tipe: tipe || "MPV",
        status: status || "STANDBY",
        aktif: aktif !== undefined ? aktif : true,
      },
    });

    return NextResponse.json({ data: armada, message: "Armada berhasil ditambahkan" }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Plat nomor sudah terdaftar" }, { status: 400 });
    }
    console.error("Admin armada POST error:", error);
    return NextResponse.json({ error: "Gagal menambahkan armada" }, { status: 500 });
  }
}
