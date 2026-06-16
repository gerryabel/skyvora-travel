// app/api/admin/jadwal/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// PUT: update jadwal
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { rute, tipe, hari, jamBerangkat, harga, asal, tujuan, bandara, kapasitas, minKuota, estimasiWaktu, aktif } = body;

    const existing = await prisma.jadwal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {};
    if (rute !== undefined) updateData.rute = rute;
    if (tipe !== undefined) updateData.tipe = tipe;
    if (hari !== undefined) updateData.hari = hari;
    if (jamBerangkat !== undefined) updateData.jamBerangkat = jamBerangkat;
    if (harga !== undefined) updateData.harga = Number(harga);
    if (asal !== undefined) updateData.asal = asal;
    if (tujuan !== undefined) updateData.tujuan = tujuan;
    if (bandara !== undefined) updateData.bandara = bandara;
    if (kapasitas !== undefined) updateData.kapasitas = Number(kapasitas);
    if (minKuota !== undefined) updateData.minKuota = Number(minKuota);
    if (estimasiWaktu !== undefined) updateData.estimasiWaktu = Number(estimasiWaktu);
    if (aktif !== undefined) updateData.aktif = aktif;

    const jadwal = await prisma.jadwal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: jadwal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: hapus jadwal
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await prisma.jadwal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    // Check if jadwal has bookings
    const bookingCount = await prisma.booking.count({ where: { jadwalId: id } });
    if (bookingCount > 0) {
      return NextResponse.json(
        { error: `Tidak bisa hapus jadwal ini karena masih memiliki ${bookingCount} booking aktif` },
        { status: 400 }
      );
    }

    await prisma.jadwal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
