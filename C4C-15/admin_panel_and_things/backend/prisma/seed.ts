import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data in reverse order of dependencies
  await prisma.followUp.deleteMany();
  await prisma.screening.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });
  await prisma.pHC.deleteMany();

  // Keep a single bootstrap admin account; all other users are created manually.
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('password123', saltRounds);

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    await prisma.user.create({
      data: {
        email: 'admin@asha.demo',
        username: 'admin',
        name: 'Admin User',
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('Bootstrap admin account created.');
  } else {
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        email: 'admin@asha.demo',
        username: 'admin',
        name: 'Admin User',
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('Bootstrap admin account refreshed.');
  }

  console.log('Testing ASHA, doctor, patient, screening, and follow-up data removed.');
  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
