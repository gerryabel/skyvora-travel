// app/api/admin/armada/[id]/jadwal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET: list jadwal terassign ke armada ini, group by hari
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    const { id: armadaId } = await params;
    const body = await req.json();
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
