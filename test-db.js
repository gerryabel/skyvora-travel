const bcrypt = require('bcryptjs');
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
    console.log('DB connection OK');
    console.log('User found:', user ? user.email : 'NO USERS');
    if (user) {
      console.log('Password hash prefix:', user.password.substring(0, 30));
      const match = await bcrypt.compare('password123', user.password);
      console.log('Password match:', match);
    }
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error('STACK:', e.stack);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}
test();
