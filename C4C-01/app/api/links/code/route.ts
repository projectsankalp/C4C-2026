import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma, Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dbErrorResponse } from "@/lib/db-errors";

const CODE_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function sixDigitCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, "0");
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (session.user.role !== Role.PATIENT) {
    return NextResponse.json(
      { error: "Only patients can generate link codes" },
      { status: 403 },
    );
  }

  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  try {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const code = sixDigitCode();
      try {
        const created = await prisma.linkCode.create({
          data: {
            code,
            patientId: session.user.id,
            expiresAt,
          },
          select: { code: true, expiresAt: true },
        });
        return NextResponse.json({
          code: created.code,
          expiresAt: created.expiresAt.toISOString(),
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          continue;
        }
        throw e;
      }
    }
    return NextResponse.json(
      { error: "Could not allocate a unique code, please retry" },
      { status: 503 },
    );
  } catch (e) {
    return dbErrorResponse(e, "Failed to generate link code");
  }
}
