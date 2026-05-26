import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { dbErrorResponse } from "@/lib/db-errors";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (session.user.role !== Role.CAREGIVER) {
    return NextResponse.json(
      { error: "Only caregivers can list linked patients" },
      { status: 403 },
    );
  }

  try {
    const links = await prisma.caregiverLink.findMany({
      where: { caregiverId: session.user.id },
      include: {
        patient: {
          include: {
            triages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            reports: {
              orderBy: { createdAt: "desc" },
              take: 5,
              select: { id: true, kind: true, createdAt: true, symptoms: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const patients = links.map((l) => {
      const last = l.patient.triages[0];
      const recentReport = l.patient.reports[0];
      return {
        id: l.patient.id,
        name: l.patient.name,
        relation: l.patient.relation ?? "Family",
        location: l.patient.location ?? "",
        permission: l.permission,
        profile: {
          age: l.patient.age ?? 0,
          gender: l.patient.gender ?? "other",
          known_conditions: l.patient.knownConditions,
          medications: l.patient.medications,
          allergies: l.patient.allergies,
        },
        last_severity: last?.severity ?? undefined,
        last_seen_iso: last?.createdAt.toISOString(),
        health_score: 75,
        reports_count: l.patient.reports.length,
        latest_report: recentReport
          ? {
              id: recentReport.id,
              kind: recentReport.kind,
              created_at: recentReport.createdAt.toISOString(),
              symptoms: recentReport.symptoms,
            }
          : null,
      };
    });

    return NextResponse.json({ patients });
  } catch (e) {
    return dbErrorResponse(e, "Failed to load patients");
  }
}
