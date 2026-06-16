const { Pool } = require('pg');
const pass = 'Redhealing' + '77' + encodeURIComponent('!');
const projectRef = 'kfkbixoivbnwbncoxbtl';
const urls = [
  // Format 1: project-ref as user suffix
  `postgresql://postgres.${projectRef}:***@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  // Format 2: project-ref in options
  `postgresql://postgres:***@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?options=project%3D${projectRef}`,
  // Format 3: direct host with project ref as db user
  `postgresql://${projectRef}:***@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
];

async function test() {
  for (const url of urls) {
    const displayUrl = url.replace(pass, '****');
    console.log('Testing:', displayUrl.substring(0, 100));
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
      console.error('FAIL:', e.code, '-', e.message.substring(0, 200));
      await pool.end();
    }
  }
}
test();
