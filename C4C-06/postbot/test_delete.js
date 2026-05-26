const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('DELETE FROM "Post" WHERE "id" = \'post_1779616690629mdawvzu\' RETURNING "id"').then(res => {
  console.log(res.rows);
  process.exit(0);
}).catch(console.error);
