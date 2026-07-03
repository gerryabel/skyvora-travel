import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth.success || auth.payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true },
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "No users found" }, { status: 400 });
    }

    const jadwals = await prisma.jadwal.findMany({
      select: { id: true, harga: true, kapasitas: true },
    });

    if (jadwals.length === 0) {
      return NextResponse.json({ error: "No jadwals found" }, { status: 400 });
    }

    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();

    const statuses = [
      "PENDING",
      "PENDING_PAYMENT",
      "PAID",
      "DIKONFIRMASI",
      "MENUNGGU_KUOTA",
    ] as const;

    let created = 0;

    for (const user of users) {
      for (let i = 0; i < 5; i++) {
        const jadwal = jadwals[i % jadwals.length];
        const status = statuses[i % statuses.length];
        const totalHarga = jadwal.harga;

        const booking = await prisma.booking.create({
          data: {
            userId: user.id,
            jadwalId: jadwal.id,
            tipeTrip: i % 2 === 0 ? "OPEN" : "PRIVATE",
            tglBerangkat: new Date(
              Date.now() + (i + 1) * 86400000
            ).toISOString().slice(0, 10),
            jumlahKursi: i + 1,
            totalHarga,
            alamatJemput: `Alamat dummy ${i + 1}`,
            catatan: i === 0 ? "" : `Catatan ${i + 1}`,
            status,
            payment:
              status === "PAID" || status === "PENDING_PAYMENT"
                ? {
                    create: {
                      orderId: `dummy-${user.id.slice(0, 4)}-${i}-${Date.now().toString(36)}`,
                      amount: totalHarga,
                      status: status === "PAID" ? "SUCCESS" : "PENDING",
                    },
                  }
                : undefined,
          },
          include: { payment: true },
        });

        created++;
      }
    }

    return NextResponse.json({
      ok: true,
      users: users.length,
      created,
      message: `Reset selesai: ${created} booking untuk ${users.length} user.`,
    });
  } catch (error) {
    console.error("Seed bookings error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
