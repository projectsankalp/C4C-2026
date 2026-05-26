import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    if (session.user.role !== Role.CAREGIVER) {
      return NextResponse.json(
        { error: "Caregiver role required" },
        { status: 403 },
      );
    }

    const links = await prisma.caregiverLink.findMany({
      where: { caregiverId: session.user.id },
      include: {
        patient: {
          include: {
            reports: {
              orderBy: { createdAt: "desc" },
              take: 20,
            },
          },
        },
      },
    });

    const feed = links
      .flatMap((link) =>
        link.patient.reports.map((r) => ({
          id: r.id,
          patientId: link.patient.id,
          patientName: link.patient.name,
          patientLocation: link.patient.location,
          permission: link.permission,
          kind: r.kind,
          filename: r.filename,
          rawText: r.rawText.slice(0, 600),
          rawTextTruncated: r.rawText.length > 600,
          symptoms: r.symptoms,
          modifiers: r.modifiers,
          labFlags: r.labFlags,
          language: r.language,
          createdAt: r.createdAt.toISOString(),
        })),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const summary = {
      total: feed.length,
      patientsWithActivity: new Set(feed.map((f) => f.patientId)).size,
      patientsLinked: links.length,
    };

    return NextResponse.json({ feed, summary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    const isDbDown =
      /P1001|P1017|connect ECONNREFUSED|reach database/i.test(msg);
    return NextResponse.json(
      {
        error: isDbDown
          ? "Database is waking up (Neon cold-start). Try again in 5–10 seconds."
          : `Feed load failed: ${msg}`,
      },
      { status: isDbDown ? 503 : 500 },
    );
  }
}
