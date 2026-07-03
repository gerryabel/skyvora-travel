// app/api/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { authenticate } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth.success) return auth.response;

    const body = await req.json();
    const { bookingId, metodePembayaran } = body;

    if (!bookingId || !metodePembayaran) {
      return NextResponse.json(
        { error: "Booking ID dan metode pembayaran wajib diisi" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: auth.payload.id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

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
