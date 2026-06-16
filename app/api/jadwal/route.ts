// app/api/jadwal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

    const jadwals = await prisma.jadwal.findMany({
      where,
      include: { armada: true },
      orderBy: [{ jamBerangkat: "asc" }],
    });

    return NextResponse.json({ data: jadwals });
  } catch (error) {
    console.error("Jadwal API error:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal" }, { status: 500 });
  }
}
