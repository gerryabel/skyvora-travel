// app/api/admin/armada/[id]/jadwal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import { prisma } from "@/app/lib/db";

// GET: list jadwal terassign ke armada ini
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.success) return guard.response;
    const { id: armadaId } = await params;
    const jadwals = await prisma.jadwal.findMany({
      where: { armadaId },
      orderBy: [{ hari: "asc" }, { jamBerangkat: "asc" }],
    });
    return NextResponse.json({ data: jadwals });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: buat jadwal baru & langsung assign ke armada ini
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.success) return guard.response;
    const { id: armadaId } = await params;
    const raw = await req.text();
    if (raw.length > 2048) {
      return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
    }
    const body = JSON.parse(raw);
    const { rute, tipe, hari, jamBerangkat, harga, asal, tujuan, bandara, kapasitas, minKuota, estimasiWaktu } = body;

    if (!rute || !tipe || !hari || !jamBerangkat || !harga) {
      return NextResponse.json({ error: "rute, tipe, hari, jamBerangkat, harga wajib diisi" }, { status: 400 });
    }

    const jadwal = await prisma.jadwal.create({
      data: {
        rute,
        tipe,
        hari,
        jamBerangkat,
        harga: Number(harga),
        asal: asal || "",
        tujuan: tujuan || "",
        bandara: bandara || "",
        kapasitas: Number(kapasitas) || 4,
        minKuota: Number(minKuota) || 1,
        estimasiWaktu: Number(estimasiWaktu) || 60,
        armadaId,
      },
    });

    return NextResponse.json({ data: jadwal }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
