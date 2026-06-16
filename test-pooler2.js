const { Pool } = require('pg');
const pass = 'Redhealing' + '77' + encodeURIComponent('!');
// Try different pooler formats
const urls = [
  'postgresql://postgres.kfkbixoivbnwbncoxbtl:***@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  'postgresql://postgres:***@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
];

async function test() {
  for (const url of urls) {
    console.log('Testing:', url.substring(0, 80) + '...');
    const pool = new Pool({
      connectionString: url,
      connectionTimeoutMillis: 8000,
      ssl: { rejectUnauthorized: false },
    });
    try {
      const r = await pool.query('SELECT 1 as test');
      console.log('SUCCESS:', r.rows);
      await pool.end();
      break;
    } catch (e) {
      console.error('FAIL:', e.code, e.message.substring(0, 150));
      await pool.end();
    }
  }
}
test();
