// app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { sendEmail } from "@/lib/email";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function notifyBookingStatus(
  booking: {
    id: string;
    status: string;
    tglBerangkat: Date;
    jamBerangkat: string;
    jumlahKursi: number;
    totalHarga: number;
  },
  user: { name: string; email: string },
  jadwal: { rute: string; jamBerangkat: string },
  action: "confirm" | "cancel" | "complete",
  alamatJemput?: string
) {
  const tgl = booking.tglBerangkat.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const bookingUrl = `${baseUrl}/booking/${booking.id}`;

  if (action === "confirm") {
    const { subject, html, text } = (await import("@/lib/email")).tplBookingConfirmed({
      userName: user.name,
      rute: jadwal.rute,
      tglBerangkat: tgl,
      jamBerangkat: jadwal.jamBerangkat,
      jumlahKursi: booking.jumlahKursi,
      totalHarga: booking.totalHarga,
      alamatJemput: alamatJemput,
      status: booking.status,
      bookingUrl,
    });
    await sendEmail(user.email, subject, html, text);
  } else if (action === "complete") {
    const { subject, html, text } = (await import("@/lib/email")).tplBookingSelesai({
      userName: user.name,
      rute: jadwal.rute,
      tglBerangkat: tgl,
      bookingUrl,
    });
    await sendEmail(user.email, subject, html, text);
  } else if (action === "cancel") {
    const { subject, html, text } = (await import("@/lib/email")).tplBookingDibatalkan({
      userName: user.name,
      rute: jadwal.rute,
      tglBerangkat: tgl,
      bookingUrl,
    });
    await sendEmail(user.email, subject, html, text);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { jadwal: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    let newStatus = booking.status;
    let updateData: any = {};

    switch (action) {
      case "confirm":
        newStatus = "DIKONFIRMASI";
        break;
      case "cancel":
        newStatus = "DIBATALKAN";
        // Kurangi kuota jadwal
        if (booking.status !== "PENDING" && booking.status !== "PENDING_PAYMENT" && booking.status !== "DIBATALKAN") {
          await prisma.jadwal.update({
            where: { id: booking.jadwalId },
            data: { terisi: { decrement: booking.jumlahKursi } },
          });
        }
        break;
      case "complete":
        if (booking.status !== "DIKONFIRMASI") {
          return NextResponse.json({ error: "Booking harus dikonfirmasi dulu" }, { status: 400 });
        }
        newStatus = "SELESAI";
        break;
      default:
        return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }

    updateData.status = newStatus;

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { jadwal: { include: { armada: true } }, user: true },
    });

    // Kirim notifikasi email async (jangan block response)
    if (updated.user?.email && updated.jadwal) {
      notifyBookingStatus(
        {
          id: updated.id,
          status: updated.status,
          tglBerangkat: new Date(updated.tglBerangkat),
          jamBerangkat: updated.jadwal.jamBerangkat,
          jumlahKursi: updated.jumlahKursi,
          totalHarga: updated.totalHarga,
        },
        { name: updated.user.name, email: updated.user.email },
        { rute: updated.jadwal.rute, jamBerangkat: updated.jadwal.jamBerangkat },
        action as "confirm" | "cancel" | "complete",
        updated.alamatJemput
      ).catch((err) => console.error("Email notification error:", err));
    }

    return NextResponse.json({ data: updated, message: `Status diubah ke ${newStatus}` });
  } catch (error) {
    console.error("Admin bookings PUT error:", error);
    return NextResponse.json({ error: "Gagal memproses aksi" }, { status: 500 });
  }
}
