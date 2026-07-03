// app/api/payment/snap/route.ts
// Generate Midtrans Snap token for non-cash payment
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
// @ts-ignore: midtrans-client has no TypeScript types
import snap, { generateOrderId, getMidtransPaymentType } from "@/lib/midtrans";
import { authenticate } from "@/app/lib/auth";
import { env } from "@/app/lib/env";

const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000";

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

    // Cash doesn't need Midtrans
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
      where: { id: bookingId, userId: auth.payload.id },
      include: { jadwal: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    const orderId = generateOrderId(booking.id);
    const paymentTypes = getMidtransPaymentType(metodePembayaran);
    const callbackBase = `${baseUrl}/pembayaran/konfirmasi`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.totalHarga,
      },
      customer_details: {
        first_name: auth.payload.name,
        email: auth.payload.email,
        phone: "",
      },
      item_details: [
        {
          id: booking.jadwalId,
          price: booking.totalHarga,
          quantity: 1,
          name: booking.jadwal && booking.jadwal.rute
            ? booking.jadwal.rute.length > 50
              ? booking.jadwal.rute.substring(0, 47) + "..."
              : booking.jadwal.rute
            : "Travel Booking",
        },
      ],
      callbacks: {
        finish: `${callbackBase}?bookingId=${bookingId}&orderId=${orderId}`,
        error: `${callbackBase}?bookingId=${bookingId}&orderId=${orderId}&status=error`,
        pending: `${callbackBase}?bookingId=${bookingId}&orderId=${orderId}&status=pending`,
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

    // Update booking with snap token and payment method
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
