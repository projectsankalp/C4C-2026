import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin
  const adminEmail = "admin@pulsepoint.local";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("PulseAdmin!2026", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "PulsePoint Admin",
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log("Seeded admin:", adminEmail, "/ password: PulseAdmin!2026");
  } else {
    console.log("Admin already exists:", adminEmail);
  }

  // Foundation Worker
  const fwEmail = "foundation@pulsepoint.local";
  const existingFW = await prisma.user.findUnique({ where: { email: fwEmail } });
  if (!existingFW) {
    const passwordHash = await bcrypt.hash("Foundation!2026", 12);
    await prisma.user.create({
      data: {
        email: fwEmail,
        name: "Foundation Worker",
        passwordHash,
        role: Role.FOUNDATION_WORKER,
      },
    });
    console.log("Seeded foundation worker:", fwEmail, "/ password: Foundation!2026");
  } else {
    console.log("Foundation worker already exists:", fwEmail);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
 
// Seed script finalized for hackathon database initialization


