// app/api/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { verifyToken } from "@/app/lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    const { bookingId, metodePembayaran } = body;

    if (!bookingId || !metodePembayaran) {
      return NextResponse.json({ error: "Booking ID dan metode pembayaran wajib diisi" }, { status: 400 });
    }

    // Validasi booking milik user
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: payload.id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    // Update booking dengan metode pembayaran
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        metodePembayaran,
        status: metodePembayaran === "cash" ? "DIKONFIRMASI" : "PENDING_PAYMENT",
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        status: updated.status,
        metodePembayaran: updated.metodePembayaran,
        totalHarga: updated.totalHarga,
      },
    });
  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
