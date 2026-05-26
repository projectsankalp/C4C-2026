require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log('DB Connection OK. Found user:', !!user);
  } catch (e) {
    console.error('DB Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
