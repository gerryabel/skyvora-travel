// app/api/payment/snap/route.ts
// Generate Midtrans Snap token for non-cash payment
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
// @ts-ignore: midtrans-client has no TypeScript types
import snap, { generateOrderId, getMidtransPaymentType } from "../../../../lib/midtrans";
import { verifyToken } from "../../../../app/lib/auth";

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
    const { bookingId, metodePembayaran, customerName, customerEmail, customerPhone } = body;

    if (!bookingId || !metodePembayaran) {
      return NextResponse.json(
        { error: "Booking ID dan metode pembayaran wajib diisi" },
        { status: 400 }
      );
    }

    // Cash tidak butuh Midtrans
    if (metodePembayaran === "cash") {
      return NextResponse.json({
        data: {
          isCash: true,
          snapToken: null,
          redirectUrl: null,
        },
      });
    }

    // Get booking from DB
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: payload.id },
      include: { jadwal: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    const orderId = generateOrderId(booking.id);
    const paymentTypes = getMidtransPaymentType(metodePembayaran);

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.totalHarga,
      },
      customer_details: {
        first_name: customerName || payload.name,
        email: customerEmail || payload.email,
        phone: customerPhone || "",
      },
      item_details: [
        {
          id: booking.jadwalId,
          price: booking.jadwal ? booking.jadwal.harga : booking.totalHarga,
          quantity: booking.jumlahKursi,
          name: booking.jadwal ? booking.jadwal.rute : "Travel Booking",
        },
      ],
      callbacks: {
        finish: `${process.env.NEXTAUTH_URL}/pembayaran/konfirmasi?bookingId=${bookingId}&orderId=${orderId}`,
        error: `${process.env.NEXTAUTH_URL}/pembayaran/konfirmasi?bookingId=${bookingId}&orderId=${orderId}&status=error`,
        pending: `${process.env.NEXTAUTH_URL}/pembayaran/konfirmasi?bookingId=${bookingId}&orderId=${orderId}&status=pending`,
      },
    };

    // Add enabled payment types if specified
    if (paymentTypes.length > 0) {
      (parameter as Record<string, unknown>).enabled_payments = paymentTypes;
    }

    console.log("Snap createTransaction params:", JSON.stringify(parameter));
    const transaction = await snap.createTransaction(parameter);
    console.log("Snap createTransaction result:", JSON.stringify(transaction));

    if (!transaction || !transaction.token) {
      console.error("Snap transaction failed - no token:", transaction);
      return NextResponse.json(
        { error: "Gagal membuat transaksi pembayaran: " + (transaction?.status_message || "Unknown error") },
        { status: 500 }
      );
    }

    // Update booking dengan snap token dan metode pembayaran
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        snapToken: transaction.token,
        metodePembayaran,
        status: "PENDING_PAYMENT",
      },
    });

    // Create payment record
    await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        orderId,
        amount: booking.totalHarga,
        method: metodePembayaran,
        status: "PENDING",
      },
      update: {
        orderId,
        amount: booking.totalHarga,
        method: metodePembayaran,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      data: {
        isCash: false,
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
      },
    });
  } catch (error) {
    console.error("Snap token error:", error);
    return NextResponse.json(
      { error: "Gagal membuat transaksi pembayaran" },
      { status: 500 }
    );
  }
}
