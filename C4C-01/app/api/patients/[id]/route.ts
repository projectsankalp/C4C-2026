import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { dbErrorResponse } from "@/lib/db-errors";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await ctx.params;

  try {
    if (session.user.role === Role.CAREGIVER) {
      const link = await prisma.caregiverLink.findUnique({
        where: {
          patientId_caregiverId: {
            patientId: id,
            caregiverId: session.user.id,
          },
        },
        include: { patient: true },
      });
      if (!link) {
        return NextResponse.json({ error: "Not linked" }, { status: 403 });
      }
      return NextResponse.json({
        patient: serialize(link.patient, link.permission),
      });
    }

    if (session.user.role === Role.PATIENT && session.user.id === id) {
      const u = await prisma.user.findUnique({ where: { id } });
      if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ patient: serialize(u, "FULL") });
    }

    if (session.user.role === Role.FOUNDATION_WORKER || session.user.role === Role.ADMIN) {
      const u = await prisma.user.findUnique({ where: { id } });
      if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ patient: serialize(u, "FULL") });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (e) {
    return dbErrorResponse(e, "Failed to load patient");
  }
}

function serialize(
  u: {
    id: string;
    name: string;
    age: number | null;
    gender: string | null;
    location: string | null;
    relation: string | null;
    knownConditions: string[];
    medications: string[];
    allergies: string[];
  },
  permission: string,
) {
  return {
    id: u.id,
    name: u.name,
    relation: u.relation ?? "Patient",
    location: u.location ?? "",
    permission,
    profile: {
      age: u.age ?? 0,
      gender: u.gender ?? "other",
      known_conditions: u.knownConditions,
      medications: u.medications,
      allergies: u.allergies,
    },
    health_score: 75,
  };
}
