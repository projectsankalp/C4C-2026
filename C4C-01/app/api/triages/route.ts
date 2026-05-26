import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { triggerEmergencyAlert } from "@/lib/twilio";
import type { SeverityTier } from "@/lib/types";
import {
  recommendDepartment,
  formatToken,
  startOfToday,
} from "@/lib/departments";
import { dbErrorResponse } from "@/lib/db-errors";
import { computeArrivalWindow, pathwayFor } from "@/lib/scheduling";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patientId = String(body.patientId ?? "");
  const severity = String(body.severity ?? "");
  const symptoms = Array.isArray(body.symptoms) ? (body.symptoms as string[]) : [];
  const vitals = body.vitals ?? null;
  const doctorBriefing =
    typeof body.doctorBriefing === "string" ? body.doctorBriefing : null;
  const requestId =
    typeof body.requestId === "string" ? body.requestId : null;

  if (!patientId || !severity) {
    return NextResponse.json(
      { error: "patientId and severity are required" },
      { status: 400 },
    );
  }

  try {
    if (session.user.role === Role.CAREGIVER) {
      const link = await prisma.caregiverLink.findUnique({
        where: {
          patientId_caregiverId: {
            patientId,
            caregiverId: session.user.id,
          },
        },
      });
      if (!link || link.permission === "VIEW_ONLY") {
        return NextResponse.json(
          { error: "Not authorized to triage for this patient" },
          { status: 403 },
        );
      }
    } else if (session.user.role === Role.PATIENT) {
      if (session.user.id !== patientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const triage = await prisma.triage.create({
      data: {
        patientId,
        severity,
        symptoms,
        vitals:
          vitals === null || vitals === undefined
            ? Prisma.JsonNull
            : (vitals as Prisma.InputJsonValue),
        doctorBriefing,
        requestId,
      },
    });

    const department = recommendDepartment(symptoms);
    const severityTier = severity as SeverityTier;
    const pathway = pathwayFor(severityTier);

    let opd: {
      pathway: typeof pathway;
      departmentName: string;
      departmentCode: string;
      token: string | null;
      position: number | null;
      arrivalWindow: ReturnType<typeof computeArrivalWindow>;
    };

    if (pathway === "TELECONSULT") {
      opd = {
        pathway,
        departmentName: department.name,
        departmentCode: department.code,
        token: null,
        position: null,
        arrivalWindow: computeArrivalWindow(severityTier, 0),
      };
    } else {
      const todaysOpdSameDept = await prisma.triage.findMany({
        where: {
          createdAt: { gte: startOfToday(), lte: triage.createdAt },
          severity: { not: "LOW" },
        },
        select: { id: true, symptoms: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      });
      const position = todaysOpdSameDept.filter(
        (t) => recommendDepartment(t.symptoms).code === department.code,
      ).length;
      const queueAhead = Math.max(0, position - 1);
      opd = {
        pathway,
        departmentName: department.name,
        departmentCode: department.code,
        token: formatToken(department.code, position),
        position,
        arrivalWindow: computeArrivalWindow(severityTier, queueAhead),
      };
    }

    if (severity === "URGENT" || severity === "EMERGENCY") {
      const patient = await prisma.user.findUnique({
        where: { id: patientId },
        select: { name: true },
      });
      triggerEmergencyAlert({
        severity: severity as SeverityTier,
        patientName: patient?.name ?? "Unknown patient",
        symptoms,
        doctorBriefing,
      }).catch((err) => console.error("Emergency alert failed:", err));
    }

    return NextResponse.json({ triage, opd });
  } catch (e) {
    return dbErrorResponse(e, "Failed to save triage");
  }
}
