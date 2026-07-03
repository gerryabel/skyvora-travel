// app/api/admin/jadwal/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import { prisma } from "@/app/lib/db";

// PUT: update jadwal
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin(req);
    if (!guard.success) return guard.response;
    const { id } = await params;
    const raw = await req.text();
    if (raw.length > 2048) {
      return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
    }
    const body = JSON.parse(raw);
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
    const guard = await requireAdmin(req);
    if (!guard.success) return guard.response;
    const { id } = await params;

    const existing = await prisma.jadwal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

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
