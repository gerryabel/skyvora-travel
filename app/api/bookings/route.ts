// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { verifyToken } from "../../lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET — ambil semua booking user
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("skyvora_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: payload.id },
      include: { jadwal: { include: { armada: true } }, payment: true, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const result = bookings.map((b) => ({
      id: b.id,
      status: b.status,
      tipeTrip: b.tipeTrip,
      tglBerangkat: b.tglBerangkat,
      jumlahKursi: b.jumlahKursi,
      totalHarga: b.totalHarga,
      metodePembayaran: b.metodePembayaran,
      snapToken: b.snapToken,
      alamatJemput: b.alamatJemput,
      catatan: b.catatan,
      nama: b.user?.name || "",
      createdAt: b.createdAt.toISOString(),
      jadwal: b.jadwal
        ? {
            rute: b.jadwal.rute,
            bandara: b.jadwal.bandara,
            tipe: b.jadwal.tipe,
            hari: b.jadwal.hari,
            jamBerangkat: b.jadwal.jamBerangkat,
            harga: b.jadwal.harga,
            armada: b.jadwal.armada
              ? { nama: b.jadwal.armada.nama, platNomor: b.jadwal.armada.platNomor }
              : null,
          }
        : null,
      payment: b.payment
        ? {
            orderId: b.payment.orderId,
            status: b.payment.status,
            method: b.payment.method,
            amount: b.payment.amount,
            paidAt: b.payment.paidAt?.toISOString() || null,
          }
        : null,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Bookings API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — buat booking baru
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("skyvora_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("POST /api/bookings body:", JSON.stringify(body));

    const {
      jadwalId,
      tipeTrip,
      tglBerangkat,
      jumlahKursi,
      nama,
      alamatJemput,
      catatan,
    } = body;

    if (!jadwalId || !tipeTrip || !tglBerangkat || !alamatJemput) {
      console.log("Missing fields:", { jadwalId, tipeTrip, tglBerangkat, alamatJemput });
      return NextResponse.json(
        { error: "Data wajib: jadwalId, tipeTrip, tglBerangkat, alamatJemput" },
        { status: 400 }
      );
    }

    // Get jadwal
    const jadwal = await prisma.jadwal.findUnique({
      where: { id: jadwalId },
    });

    if (!jadwal) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    if (!jadwal.aktif) {
      return NextResponse.json({ error: "Jadwal tidak aktif" }, { status: 400 });
    }

    const kursi = jumlahKursi || 1;
    const sisaKursi = jadwal.kapasitas - jadwal.terisi;

    if (kursi > sisaKursi) {
      return NextResponse.json(
        { error: `Sisa kursi tidak cukup. Tersisa ${sisaKursi} kursi.` },
        { status: 400 }
      );
    }

    // Calculate total harga
    const harga = tipeTrip === "PRIVATE"
      ? jadwal.harga * jadwal.kapasitas
      : jadwal.harga * kursi;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: payload.id,
        jadwalId,
        tipeTrip,
        tglBerangkat,
        jumlahKursi: kursi,
        totalHarga: harga,
        alamatJemput,
        catatan: catatan || "",
        status: "PENDING",
      },
    });

    // Update terisi count
    await prisma.jadwal.update({
      where: { id: jadwalId },
      data: { terisi: { increment: kursi } },
    });

    return NextResponse.json({
      data: {
        id: booking.id,
        status: booking.status,
        totalHarga: booking.totalHarga,
        tipeTrip: booking.tipeTrip,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
