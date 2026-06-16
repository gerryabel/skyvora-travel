const { Pool } = require('pg');
const dns = require('dns');
const pass = 'Redhealing' + '77' + encodeURIComponent('!');

// Force IPv4
dns.setDefaultResultOrder('ipv4first');

const url = 'postgresql://postgres:***@db.kfkbixoivbnwbncoxbtl.supabase.co:5432/postgres';
const pool = new Pool({
  connectionString: url,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },
});
pool.query('SELECT 1 as test')
  .then(r => { console.log('SUCCESS:', r.rows); return pool.end(); })
  .catch(e => { console.error('ERROR:', e.code, e.message.substring(0, 300)); return pool.end(); });
