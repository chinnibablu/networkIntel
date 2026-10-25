const { Pool } = require('pg');

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing. Add it to .env');

const local = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: local ? false : { rejectUnauthorized: false }, // Render requires SSL
  max: 5,
});

// Keep this app's tables in their own schema so they never touch other data in the same database.
pool.on('connect', c => c.query('SET search_path TO networking, public'));
pool.on('error', e => console.error('Postgres pool error:', e.message));

module.exports = pool;