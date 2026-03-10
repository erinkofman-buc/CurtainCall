const { Pool } = require('pg');
const env = require('./env');

const poolConfig = {
  connectionString: env.databaseUrl,
};

// Render requires SSL for external DB connections
if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
