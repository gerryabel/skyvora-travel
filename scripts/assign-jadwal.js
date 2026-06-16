// scripts/assign-jadwal.js
// Assign jadwal ke armada secara rata (round-robin)

require("dotenv").config();
const { PrismaClient } = require("../app/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get all active armadas
  const armadas = await prisma.armada.findMany({
    where: { aktif: true },
    orderBy: { nama: "asc" },
  });

  // Get all jadwals
  const jadwals = await prisma.jadwal.findMany({
    orderBy: [{ hari: "asc" }, { jamBerangkat: "asc" }],
  });

  if (armadas.length === 0) {
    console.log("Tidak ada armada aktif.");
    return;
  }

  if (jadwals.length === 0) {
    console.log("Tidak ada jadwal.");
    return;
  }

  console.log(`\n${armadas.length} armada aktif, ${jadwals.length} jadwal\n`);

  // Unassign all jadwals first
  await prisma.jadwal.updateMany({
    data: { armadaId: null },
  });
  console.log("✓ Semua jadwal di-unassign dulu\n");

  // Assign round-robin in batches
  const batchSize = 50;
  let assigned = 0;

  for (let i = 0; i < jadwals.length; i++) {
    const armadaIndex = i % armadas.length;
    await prisma.jadwal.update({
      where: { id: jadwals[i].id },
      data: { armadaId: armadas[armadaIndex].id },
    });
    assigned++;

    if (assigned % 100 === 0) {
      console.log(`  ... ${assigned}/${jadwals.length} jadwal di-assign`);
    }
  }

  // Print summary per armada
  console.log("\n=== HASIL ASSIGNMENT ===\n");

  for (const armada of armadas) {
    const count = await prisma.jadwal.count({
      where: { armadaId: armada.id },
    });
    const sampleJadwals = await prisma.jadwal.findMany({
      where: { armadaId: armada.id },
      take: 3,
      orderBy: [{ hari: "asc" }, { jamBerangkat: "asc" }],
    });

    console.log(`[${armada.nama}] (${armada.platNomor}) -- ${count} jadwal`);
    for (const j of sampleJadwals) {
      console.log(`   - ${j.rute} | ${j.hari} ${j.jamBerangkat} | ${j.tipe}`);
    }
    if (count > 3) console.log(`   ... dan ${count - 3} jadwal lainnya`);
    console.log();
  }

  console.log(`Selesai! ${jadwals.length} jadwal dibagi rata ke ${armadas.length} armada.`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
