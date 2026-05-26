require('dotenv').config({ path: __dirname + '/.env' });
const { ensureMobileSchema } = require('./schema');

// The `users` table is now owned by the admin panel's Prisma migrations.
// This seed only ensures the Express-owned tables exist.

async function run() {
  try {
    await ensureMobileSchema();
    console.log('mobile tables ready');

    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

run();