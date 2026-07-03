import { prisma } from "../app/lib/db";

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
  });

  console.log("Users:", users.map((u) => u.name).join(", ") || "(none)");

  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  console.log("Deleted all bookings and payments.");

  const jadwals = await prisma.jadwal.findMany({ select: { id: true, harga: true, kapasitas: true } });
  console.log("Jadwals:", jadwals.length);

  const statuses = ["PENDING", "PENDING_PAYMENT", "PAID", "DIKONFIRMASI", "MENUNGGU_KUOTA"] as const;

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
          tglBerangkat: new Date(Date.now() + (i + 1) * 86400000).toISOString().slice(0, 10),
          jumlahKursi: i + 1,
          totalHarga,
          alamatJemput: `Alamat dummy ${i + 1}`,
          catatan: i === 0 ? "" : `Catatan ${i + 1}`,
          status,
          payment: status === "PAID" || status === "PENDING_PAYMENT" ? {
            create: {
              orderId: `dummy-${user.id.slice(0, 4)}-${i}-${Date.now().toString(36)}`,
              amount: totalHarga,
              status: status === "PAID" ? "SUCCESS" : "PENDING",
            },
          } : undefined,
        },
        include: { payment: true },
      });

      created++;
      console.log(`Created booking ${booking.id.slice(0, 8)} for ${user.name} (${status})`);
    }
  }

  console.log(`Done. Created ${created} bookings.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  });
