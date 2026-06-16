const { Pool } = require('pg');
const pass = 'Redhealing' + '77' + encodeURIComponent('!');
const ref = 'kfkbixoivbnwbncoxbtl';

// Supabase pooler format: postgres.[project-ref]@[pooler-host]:6543/postgres
const url = `postgresql://postgres.${ref}:***@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
const pool = new Pool({
  connectionString: url,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },
});
pool.query('SELECT 1 as test')
  .then(r => { console.log('SUCCESS:', r.rows); return pool.end(); })
  .catch(e => { console.error('ERROR:', e.code, '-', e.message.substring(0, 300)); return pool.end(); });
