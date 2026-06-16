const { Pool } = require('pg');
const pass = 'Redhealing' + '77' + encodeURIComponent('!');
const url = 'postgresql://postgres:' + pass + '@db.kfkbixoivbnwbncoxbtl.supabase.co:5432/postgres';
const pool = new Pool({
  connectionString: url,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },
});
pool.query('SELECT 1 as test')
  .then(r => { console.log('SUCCESS:', r.rows); return pool.end(); })
  .catch(e => { console.error('ERROR:', e.code, e.message.substring(0, 200)); return pool.end(); });
