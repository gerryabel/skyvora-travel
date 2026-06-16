const { PrismaClient } = require('./app/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const user = await prisma.user.findFirst();
    console.log('DB OK, user:', user ? user.email : 'none');
  } catch (e) {
    console.error('FULL ERROR:', e.message || e);
    console.error('CODE:', e.code);
    console.error('META:', JSON.stringify(e.meta));
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}
test();
