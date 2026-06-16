// app/api/admin/armada/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
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
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Admin armada GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data armada" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
