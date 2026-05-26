import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { dbErrorResponse } from "@/lib/db-errors";

const VALID_ROLES: Role[] = [Role.PATIENT, Role.CAREGIVER, Role.FOUNDATION_WORKER];

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email ?? "").toLowerCase().trim();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();
  const roleRaw = String(body.role ?? "");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!VALID_ROLES.includes(roleRaw as Role)) {
    return NextResponse.json(
      { error: "Role must be PATIENT, CAREGIVER, or FOUNDATION_WORKER" },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const patientFields =
      roleRaw === Role.PATIENT
        ? {
            age: typeof body.age === "number" ? body.age : null,
            gender: typeof body.gender === "string" ? body.gender : null,
            location: typeof body.location === "string" ? body.location : null,
            knownConditions: Array.isArray(body.knownConditions)
              ? (body.knownConditions as string[])
              : [],
            medications: Array.isArray(body.medications)
              ? (body.medications as string[])
              : [],
            allergies: Array.isArray(body.allergies)
              ? (body.allergies as string[])
              : [],
          }
        : {};

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: roleRaw as Role,
        ...patientFields,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return dbErrorResponse(e, "Signup failed");
  }
}
