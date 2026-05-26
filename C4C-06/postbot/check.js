const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT * FROM "Post"').then(res => {
  console.log('Posts:', res.rows);
  process.exit(0);
}).catch(console.error);
