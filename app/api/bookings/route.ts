// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/lib/auth";
import { requireRateLimit } from "@/app/lib/rateLimit";
import { prisma } from "@/app/lib/db";

// GET — ambil semua booking user, atau satu booking by id jika diberikan query ?id=
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth.success) return auth.response;

    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const booking = await prisma.booking.findFirst({
        where: { id, userId: auth.payload.id },
        include: {
          jadwal: {
            include: {
              armada: {
                select: {
                  nama: true,
                  platNomor: true,
                },
              },
            },
          },
          payment: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!booking) {
        return NextResponse.json({ data: null }, { status: 404 });
      }

      return NextResponse.json({
        data: {
          id: booking.id,
          status: booking.status,
          tipeTrip: booking.tipeTrip,
          tglBerangkat: booking.tglBerangkat,
          jumlahKursi: booking.jumlahKursi,
          totalHarga: booking.totalHarga,
          metodePembayaran: booking.metodePembayaran,
          snapToken: booking.snapToken,
          alamatJemput: booking.alamatJemput,
          catatan: booking.catatan,
          nama: booking.user?.name || "",
          createdAt: booking.createdAt.toISOString(),
          jadwal: booking.jadwal
            ? {
                rute: booking.jadwal.rute,
                bandara: booking.jadwal.bandara,
                tipe: booking.jadwal.tipe,
                hari: booking.jadwal.hari,
                jamBerangkat: booking.jadwal.jamBerangkat,
                harga: booking.jadwal.harga,
                armada: booking.jadwal.armada
                  ? {
                      nama: booking.jadwal.armada.nama,
                      platNomor: booking.jadwal.armada.platNomor,
                    }
                  : null,
              }
            : null,
          payment: booking.payment
            ? {
                orderId: booking.payment.orderId,
                status: booking.payment.status,
                method: booking.payment.method,
                amount: booking.payment.amount,
                paidAt: booking.payment.paidAt?.toISOString() || null,
              }
            : null,
        },
      });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: auth.payload.id },
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
    const auth = await authenticate(req);
    if (!auth.success) return auth.response;

    const blocked = await requireRateLimit(req, "booking:create", 10, 60_000);
    if (blocked) return blocked;

    const raw = await req.text();
    if (raw.length > 2048) {
      return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
    }
    const body = JSON.parse(raw);
    console.log("POST /api/bookings payload keys:", Object.keys(body));

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
        userId: auth.payload.id,
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
