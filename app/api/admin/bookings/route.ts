// app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        jadwal: { include: { armada: true } },
        payment: true,
        user: { select: { name: true, email: true, phone: true } },
      },
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
              ? { nama: b.jadwal.armada.nama, platNomor: b.jadwal.armada.platNomor, status: b.jadwal.armada.status, returnAt: b.jadwal.armada.returnAt?.toISOString() || null }
              : null,
          }
        : null,
      user: b.user
        ? { name: b.user.name, email: b.user.email, phone: b.user.phone }
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
    console.error("Admin bookings API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
