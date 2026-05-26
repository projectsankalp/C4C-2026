import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Permission, Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dbErrorResponse } from "@/lib/db-errors";

const ALLOWED_PERMISSIONS: Permission[] = [
  Permission.VIEW_ONLY,
  Permission.TRIAGE,
  Permission.FULL,
];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (session.user.role !== Role.CAREGIVER) {
    return NextResponse.json(
      { error: "Only caregivers can redeem link codes" },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const permissionInput =
    typeof body.permission === "string" ? body.permission : "";

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Code must be a 6-digit number" },
      { status: 400 },
    );
  }
  if (!ALLOWED_PERMISSIONS.includes(permissionInput as Permission)) {
    return NextResponse.json(
      { error: "Invalid permission level" },
      { status: 400 },
    );
  }
  const permission = permissionInput as Permission;

  try {
    const linkCode = await prisma.linkCode.findUnique({
      where: { code },
      include: { patient: { select: { id: true, name: true } } },
    });

    if (!linkCode) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 });
    }
    if (linkCode.redeemed) {
      return NextResponse.json(
        { error: "Code has already been redeemed" },
        { status: 410 },
      );
    }
    if (linkCode.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Code has expired" }, { status: 410 });
    }
    if (linkCode.patientId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot redeem your own code" },
        { status: 400 },
      );
    }

    const linked = await prisma.$transaction(async (tx) => {
      const consumed = await tx.linkCode.updateMany({
        where: { id: linkCode.id, redeemed: false },
        data: { redeemed: true },
      });
      if (consumed.count === 0) {
        throw new Error("Code has already been redeemed");
      }

      const link = await tx.caregiverLink.upsert({
        where: {
          patientId_caregiverId: {
            patientId: linkCode.patientId,
            caregiverId: session.user.id,
          },
        },
        create: {
          patientId: linkCode.patientId,
          caregiverId: session.user.id,
          permission,
        },
        update: { permission },
      });

      return {
        patientId: link.patientId,
        patientName: linkCode.patient.name,
        permission: link.permission,
      };
    });

    return NextResponse.json({ linked });
  } catch (e) {
    return dbErrorResponse(e, "Failed to redeem link code");
  }
}
