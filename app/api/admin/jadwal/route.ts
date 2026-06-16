// app/api/admin/jadwal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(req: NextRequest) {
  try {
    const jadwals = await prisma.jadwal.findMany({
      where: {},
      include: { armada: true },
      orderBy: [
        { hari: "asc" },
        { jamBerangkat: "asc" },
      ],
    });
    return NextResponse.json({ data: jadwals });
  } catch (error) {
    console.error("Admin jadwal GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal" }, { status: 500 });
  }
}

// POST dihapus — jadwal hanya di-seed, admin tidak bisa tambah manual

