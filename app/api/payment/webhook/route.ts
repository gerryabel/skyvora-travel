// app/api/payment/webhook/route.ts
// Midtrans webhook handler untuk konfirmasi pembayaran otomatis
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import crypto from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const expectedSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Find payment by orderId
    const payment = await prisma.payment.findUnique({
      where: { orderId: order_id },
      include: { booking: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Determine new status
    let newPaymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" = "PENDING";
    let newBookingStatus: string | null = null;

    if (transaction_status === "settlement" || transaction_status === "capture") {
      // Payment success
      newPaymentStatus = "SUCCESS";
      newBookingStatus = payment.booking.tipeTrip === "PRIVATE"
        ? "DIKONFIRMASI"
        : "MENUNGGU_KUOTA";
    } else if (transaction_status === "pending") {
      // Payment pending (VA, etc)
      newPaymentStatus = "PENDING";
      newBookingStatus = "PENDING_PAYMENT";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      newPaymentStatus = "FAILED";
      newBookingStatus = "DIBATALKAN";
    }

    // Handle fraud status
    if (fraud_status === "deny") {
      newPaymentStatus = "FAILED";
      newBookingStatus = "DIBATALKAN";
    }

    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newPaymentStatus,
        paidAt: newPaymentStatus === "SUCCESS" ? new Date() : undefined,
      },
    });

    // Update booking
    if (newBookingStatus) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: newBookingStatus as "PENDING" | "PAID" | "MENUNGGU_KUOTA" | "DIKONFIRMASI" | "PENDING_PAYMENT" | "BERANGKAT" | "SELESAI" | "DIBATALKAN" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
