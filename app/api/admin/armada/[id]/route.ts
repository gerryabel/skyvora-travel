// app/api/admin/armada/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const armada = await prisma.armada.findUnique({
      where: { id },
      include: {
        jadwals: {
          select: {
            id: true,
            rute: true,
            tipe: true,
            hari: true,
            jamBerangkat: true,
            aktif: true,
          },
          orderBy: { jamBerangkat: "asc" },
        },
      },
    });
    if (!armada) {
      return NextResponse.json({ error: "Armada tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ data: armada });
  } catch (error) {
    console.error("Admin armada GET [id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil data armada" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nama, platNomor, kapasitas, tipe, status, aktif } = body;

    const existing = await prisma.armada.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Armada tidak ditemukan" }, { status: 404 });
    }

    const armada = await prisma.armada.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(platNomor && { platNomor }),
        ...(kapasitas !== undefined && { kapasitas: Number(kapasitas) }),
        ...(tipe && { tipe }),
        ...(status && { status }),
        ...(aktif !== undefined && { aktif }),
      },
    });

    return NextResponse.json({ data: armada, message: "Armada berhasil diperbarui" });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Plat nomor sudah terdaftar" }, { status: 400 });
    }
    console.error("Admin armada PUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui armada" }, { status: 500 });
  }
}

// PATCH — quick status change only
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const existing = await prisma.armada.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Armada tidak ditemukan" }, { status: 404 });
    }

    const validStatuses = ["STANDBY", "DALAM_PERJALANAN", "MAINTENANCE", "TIDAK_AKTIF"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const armada = await prisma.armada.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ data: armada, message: `Status diubah ke ${status}` });
  } catch (error) {
    console.error("Admin armada PATCH error:", error);
    return NextResponse.json({ error: "Gagal mengubah status" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.armada.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Armada tidak ditemukan" }, { status: 404 });
    }

    const jadwalCount = await prisma.jadwal.count({ where: { armadaId: id } });
    if (jadwalCount > 0) {
      return NextResponse.json(
        { error: `Tidak bisa hapus — masih ada ${jadwalCount} jadwal yang menggunakan armada ini` },
        { status: 400 }
      );
    }

    await prisma.armada.delete({ where: { id } });
    return NextResponse.json({ message: "Armada berhasil dihapus" });
  } catch (error) {
    console.error("Admin armada DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus armada" }, { status: 500 });
  }
}
