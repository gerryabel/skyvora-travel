const fs = require('fs');
const path = require('path');

const files = [
  'app/api/admin/armada/route.ts',
  'app/api/admin/armada/[id]/jadwal/route.ts',
  'app/api/admin/armada/[id]/route.ts',
  'app/api/admin/bookings/route.ts',
  'app/api/admin/bookings/[id]/route.ts',
  'app/api/admin/dashboard/pendapatan/route.ts',
  'app/api/admin/jadwal/route.ts',
  'app/api/admin/jadwal/[id]/route.ts',
  'app/api/admin/stats/route.ts',
  'app/api/admin/users/route.ts',
  'app/api/admin/users/[id]/route.ts',
  'app/api/bookings/route.ts',
  'app/api/payment/route.ts',
  'app/api/payment/snap/route.ts',
  'app/api/payment/webhook/route.ts',
];

const root = 'C:/Users/Administrator/Documents/VsCode/travel-booking';

const oldHeader = `import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "REPLACE_ME";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });`;

let changed = 0;
let failed = 0;

for (const rel of files) {
  const full = path.join(root, rel);
  let content = fs.readFileSync(full, 'utf-8');

  // Determine correct relative import path based on location
  const depth = rel.includes('/admin/') 
    ? rel.split('/').slice(0, 4).join('/') 
    : rel.split('/').slice(0, 2).join('/');
  
  // Build import path: from app/api/admin/armada/route.ts => ../../../generated/prisma/client
  // or from app/api/bookings/route.ts => ../../generated/prisma/client
  const parts = rel.split('/'); // e.g. ['app', 'api', 'admin', 'armada', 'route.ts']
  const upCount = parts.length - 3; // number of .. to reach app/
  const importPath = '../'.repeat(upCount) + 'generated/prisma/client';

  const header = `import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "${importPath}";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });`;

  if (!content.includes('const prisma = new PrismaClient({ adapter });')) {
    console.log(`SKIP (no prisma instantiation): ${rel}`);
    failed++;
    continue;
  }

  content = content.replace(
    /import \{ PrismaClient \} from ".*?";\nimport \{ PrismaPg \} from "@prisma\/adapter-pg";\nimport \{ Pool \} from "pg";\n\nconst pool = new Pool\(\{ connectionString: process\.env\.DATABASE_URL \}\);\nconst adapter = new PrismaPg\(pool\);\nconst prisma = new PrismaClient\(\{ adapter \}\);/,
    `import { prisma } from "@/app/lib/db";`
  );

  if (content.includes('const prisma = new PrismaClient({ adapter });')) {
    console.log(`FAILED regex replace: ${rel}`);
    failed++;
    continue;
  }

  fs.writeFileSync(full, content, 'utf-8');
  console.log(`PATCHED: ${rel}`);
  changed++;
}

console.log(`\nDone: ${changed} patched, ${failed} skipped/failed`);
