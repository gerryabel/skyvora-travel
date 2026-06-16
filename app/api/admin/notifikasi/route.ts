// app/api/admin/notifikasi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

type BroadcastTarget = "all" | "booking" | "status";

interface BroadcastBody {
  target: BroadcastTarget;
  subject: string;
  message: string;
  bookingId?: string;
  status?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: BroadcastBody = await req.json();
    const { target, subject, message, bookingId, status } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject dan message wajib diisi" },
        { status: 400 }
      );
    }

    let recipients: { name: string; email: string }[] = [];

    if (target === "all") {
      // Kirim ke semua user
      const users = await prisma.user.findMany({
        where: { role: "USER" },
        select: { name: true, email: true },
      });
      recipients = users;
    } else if (target === "booking" && bookingId) {
      // Kirim ke user booking tertentu
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: { select: { name: true, email: true } } },
      });
      if (booking?.user) {
        recipients = [{ name: booking.user.name, email: booking.user.email }];
      }
    } else if (target === "status" && status) {
      // Kirim ke semua user yang booking dengan status tertentu
      const bookings = await prisma.booking.findMany({
        where: { status: status as any },
        include: { user: { select: { name: true, email: true } } },
        distinct: ["userId"],
      });
      recipients = bookings
        .filter((b: any) => b.user)
        .map((b: any) => ({ name: b.user!.name, email: b.user!.email }));
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada penerima yang ditemukan" },
        { status: 404 }
      );
    }

    // Kirim email ke semua penerima
    const results = await Promise.allSettled(
      recipients.map((r) =>
        sendEmail(
          r.email,
          subject,
          `
<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#f5f3f0;padding:20px;">
  <div style="background:#1a1a2e;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">
      <span style="color:#60a5fa;">Skyvora</span> Travel
    </h1>
  </div>
  <div style="background:#fff;border-radius:0 0 12px 12px;padding:32px;border:1px solid #e5e7eb;">
    <h2 style="color:#111;margin:0 0 8px;">Halo, ${r.name} 👋</h2>
    <div style="color:#374151;font-size:15px;line-height:1.7;margin-bottom:20px;">
      ${message.replace(/\n/g, "<br>")}
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="color:#9ca3af;font-size:12px;text-align:center;">
      © 2026 Skyvora Travel — Email ini dikirim otomatis, mohon tidak membalas.
    </p>
  </div>
</div>`,
          `Halo ${r.name},\n\n${message}\n\n© 2026 Skyvora Travel`
        )
      )
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      total: recipients.length,
      succeeded,
      failed,
    });
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim notifikasi" },
      { status: 500 }
    );
  }
}

// GET: ambil daftar booking untuk dropdown
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "bookings") {
      const bookings = await prisma.booking.findMany({
        include: {
          user: { select: { name: true, email: true } },
          jadwal: { select: { rute: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return NextResponse.json(bookings);
    }

    if (type === "stats") {
      const statuses = [
        "PENDING",
        "PENDING_PAYMENT",
        "PAID",
        "DIKONFIRMASI",
        "BERANGKAT",
        "SELESAI",
        "DIBATALKAN",
      ];
      const counts = await Promise.all(
        statuses.map(async (s) => ({
          status: s,
          count: await prisma.booking.count({ where: { status: s as any } }),
        }))
      );
      const totalUsers = await prisma.user.count({ where: { role: "USER" } });
      return NextResponse.json({ statuses: counts, totalUsers });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Notifikasi GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, {status: 500});
  }
}
