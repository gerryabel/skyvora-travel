const { Pool } = require('pg');
const pass = 'Redhealing' + '77' + encodeURIComponent('!');
const ref = 'kfkbixoivbnwbncoxbtl';

const urls = [
  // PgBouncer pooler - format 1
  `postgresql://postgres.${ref}:***@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  // PgBouncer pooler - format 2 (region tanpa aws-0)
  `postgresql://postgres.${ref}:***@ap-southeast-1.pooler.supabase.com:6543/postgres`,
  // Supavisor pooler
  `postgresql://postgres.${ref}:***@db.${ref}.supabase.co:6543/postgres`,
  // Direct with port 6543
  `postgresql://postgres:***@db.${ref}.supabase.co:6543/postgres`,
];

async function test() {
  for (const url of urls) {
    const display = url.replace(pass, '****');
    console.log('Testing:', display.substring(0, 90));
    const pool = new Pool({
      connectionString: url,
      connectionTimeoutMillis: 8000,
      ssl: { rejectUnauthorized: false },
    });
    try {
      const r = await pool.query('SELECT 1 as test');
      console.log('✅ SUCCESS:', r.rows);
      await pool.end();
      return url;
    } catch (e) {
      console.error('❌', e.code, '-', e.message.substring(0, 150));
      await pool.end();
    }
  }
  console.log('\nSemua gagal. Coba cek Supabase dashboard untuk connection string yang benar.');
}
test();
