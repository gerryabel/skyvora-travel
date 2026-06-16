// scripts/assign-jadwal.ts
// Assign jadwal ke armada secara rata (round-robin)

require("dotenv").config();
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

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

  console.log(`\n📋 ${armadas.length} armada aktif, ${jadwals.length} jadwal\n`);

  // Unassign all jadwals first
  await prisma.jadwal.updateMany({
    data: { armadaId: null },
  });
  console.log("✓ Semua jadwal di-unassign dulu\n");

  // Assign round-robin: bagi rata jadwal ke armada
  // Strategy: distribute jadwals evenly across armadas
  // Each armada gets roughly jadwals.length / armadas.length jadwals
  const assignments: { jadwalId: string; armadaId: string }[] = [];

  for (let i = 0; i < jadwals.length; i++) {
    const armadaIndex = i % armadas.length;
    assignments.push({
      jadwalId: jadwals[i].id,
      armadaId: armadas[armadaIndex].id,
    });
  }

  // Apply assignments
  for (const a of assignments) {
    await prisma.jadwal.update({
      where: { id: a.jadwalId },
      data: { armadaId: a.armadaId },
    });
  }

  // Print summary
  console.log("=== HASIL ASSIGNMENT ===\n");
  for (const armada of armadas) {
    const count = assignments.filter(a => a.armadaId === armada.id).length;
    const armadaJadwals = assignments
      .filter(a => a.armadaId === armada.id)
      .map(a => jadwals.find(j => j.id === a.jadwalId)!);

    console.log(`🚐 ${armada.nama} (${armada.platNomor}) — ${count} jadwal:`);
    for (const j of armadaJadwals) {
      console.log(`   • ${j.rute} | ${j.hari} ${j.jamBerangkat} | ${j.tipe}`);
    }
    console.log();
  }

  console.log(`✓ Selesai! ${jadwals.length} jadwal dibagi rata ke ${armadas.length} armada.`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
