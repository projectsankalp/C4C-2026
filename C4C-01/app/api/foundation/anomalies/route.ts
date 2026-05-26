import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assessSanitationRisk } from "@/lib/sanitation";
import { triggerFollowUpMissedAlert } from "@/lib/twilio";
import fs from "fs";
import path from "path";
 
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FORTY_EIGHT_H_MS = 2 * 60 * 1000; // Demo mode: 2 minutes threshold instead of 48 hours
 
const CACHE_FILE = path.join(process.cwd(), "missed_alerts_cache.json");
 
function getAlertedIds(): Set<string> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf8");
      return new Set(JSON.parse(data));
    }
  } catch (err) {
    console.error("Failed to read alerted ids cache:", err);
  }
  return new Set();
}
 
function saveAlertedIds(ids: Set<string>) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(Array.from(ids)), "utf8");
  } catch (err) {
    console.error("Failed to write alerted ids cache:", err);
  }
}
 
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "FOUNDATION_WORKER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
 
  const since7d = new Date(Date.now() - SEVEN_DAYS_MS);
  const since48h = new Date(Date.now() - FORTY_EIGHT_H_MS);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
 
  const triages = await prisma.triage.findMany({
    where: { createdAt: { gte: since7d } },
    include: {
      patient: { select: { id: true, name: true, age: true, gender: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
  });
 
  // ── 1. Cluster alerts: 3+ URGENT/EMERGENCY from same village in 7 days ──────
  const locationMap = new Map<string, typeof triages>();
  for (const t of triages) {
    if (t.severity !== "URGENT" && t.severity !== "EMERGENCY" && t.severity !== "HIGH") continue;
    const loc = t.patient.location ?? "Unknown";
    if (!locationMap.has(loc)) locationMap.set(loc, []);
    locationMap.get(loc)!.push(t);
  }
  const clusters = Array.from(locationMap.entries())
    .filter(([, cases]) => cases.length >= 3)
    .map(([village, cases]) => ({
      type: "CLUSTER" as const,
      village,
      count: cases.length,
      latestSeverity: cases[0].severity,
      message: `${cases.length} high-risk cases detected in ${village} in the last 7 days.`,
      action: `Deploy a mobile screening camp to ${village} immediately.`,
    }));
 
  // ── 2. Rapid spike: today's high-risk > 2× yesterday's ──────────────────────
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);
  const todayHigh = triages.filter(
    (t) =>
      t.createdAt >= todayStart &&
      (t.severity === "URGENT" || t.severity === "EMERGENCY" || t.severity === "HIGH"),
  ).length;
  const yesterdayHigh = triages.filter(
    (t) =>
      t.createdAt >= yesterdayStart &&
      t.createdAt < todayStart &&
      (t.severity === "URGENT" || t.severity === "EMERGENCY" || t.severity === "HIGH"),
  ).length;
  const spikes =
    yesterdayHigh > 0 && todayHigh >= yesterdayHigh * 2
      ? [
          {
            type: "SPIKE" as const,
            todayCount: todayHigh,
            yesterdayCount: yesterdayHigh,
            message: `High-risk cases spiked ${todayHigh} today vs ${yesterdayHigh} yesterday — a ${Math.round(todayHigh / yesterdayHigh)}× increase.`,
            action: "Review recent screenings and alert district health officer.",
          },
        ]
      : [];
 
  // ── 3. Missed follow-ups: URGENT/EMERGENCY with no triage update in 2 mins ──
  // Group by patient to find the latest triage of each
  const latestTriageByPatient = new Map<string, typeof triages[number]>();
  for (const t of triages) {
    const pid = t.patient.id;
    if (!latestTriageByPatient.has(pid)) {
      latestTriageByPatient.set(pid, t);
    }
  }
 
  const alertedIds = getAlertedIds();
  let alertedCacheChanged = false;
 
  const missedFollowups = Array.from(latestTriageByPatient.values())
    .filter(
      (t) =>
        t.createdAt <= since48h &&
        (t.severity === "URGENT" || t.severity === "EMERGENCY" || t.severity === "HIGH"),
    )
    .map((t) => {
      // Trigger Twilio call/SMS to +916363640564 if not already notified for this missed event
      if (!alertedIds.has(t.patient.id)) {
        alertedIds.add(t.patient.id);
        alertedCacheChanged = true;
        
        triggerFollowUpMissedAlert(t.patient.name).catch((err) => {
          console.error(`Failed to trigger Twilio call/SMS for missed follow-up of ${t.patient.name}:`, err);
        });
      }
 
      const diffMs = Date.now() - t.createdAt.getTime();
      const mins = Math.round(diffMs / 60_000);
      const timeStr = mins < 60 ? `${mins}m` : `${Math.round(mins / 60)}h`;
      return {
        type: "MISSED_FOLLOWUP" as const,
        patientId: t.patient.id,
        patientName: t.patient.name,
        village: t.patient.location ?? "Unknown",
        severity: t.severity,
        hoursAgo: mins / 60,
        message: `${t.patient.name} was screened ${timeStr} ago at ${t.severity} risk with no follow-up recorded.`,
        action: `Call ${t.patient.name} or visit their village (${t.patient.location ?? "unknown"}) today.`,
      };
    })
    .slice(0, 10);
 
  // Clean up alerted cache for patients who are no longer in missed followups (e.g. resolved)
  const currentMissedPatientIds = new Set(missedFollowups.map(m => m.patientId));
  for (const id of alertedIds) {
    if (!currentMissedPatientIds.has(id)) {
      alertedIds.delete(id);
      alertedCacheChanged = true;
    }
  }
 
  if (alertedCacheChanged) {
    saveAlertedIds(alertedIds);
  }
 
  // ── 4. Sanitation signals: 3+ patients with sanitation symptoms, same village ─
  const sanMap = new Map<string, { count: number; hints: string[] }>();
  for (const t of triages) {
    const sr = assessSanitationRisk(t.symptoms);
    if (!sr.flagged) continue;
    const loc = t.patient.location ?? "Unknown";
    const existing = sanMap.get(loc);
    if (!existing) sanMap.set(loc, { count: 1, hints: sr.hints });
    else {
      existing.count += 1;
      sr.hints.forEach((h) => { if (!existing.hints.includes(h)) existing.hints.push(h); });
    }
  }
  const sanitationSignals = Array.from(sanMap.entries())
    .filter(([, { count }]) => count >= 3)
    .map(([village, { count, hints }]) => ({
      type: "SANITATION" as const,
      village,
      count,
      hints,
      message: `${count} patients from ${village} show sanitation-linked symptoms in the last 7 days.`,
      action: `Alert district sanitation officer for ${village}. ${hints[0] ?? ""}`,
    }));
 
  // ── Summary stats ────────────────────────────────────────────────────────────
  const allTriages = await prisma.triage.findMany({
    include: {
      patient: { select: { id: true, name: true, age: true, gender: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
 
  const todayTriages = allTriages.filter((t) => t.createdAt >= todayStart);
  const highRiskToday = todayTriages.filter(
    (t) => t.severity === "URGENT" || t.severity === "EMERGENCY" || t.severity === "HIGH",
  ).length;
 
  return NextResponse.json({
    stats: {
      totalPatients: allTriages.length,
      screenedToday: todayTriages.length,
      highRiskToday,
      anomalyCount:
        clusters.length + spikes.length + missedFollowups.length + sanitationSignals.length,
    },
    anomalies: {
      clusters,
      spikes,
      missedFollowups,
      sanitationSignals,
    },
    recentPatients: allTriages.slice(0, 50).map((t) => ({
      id: t.id,
      patientName: t.patient.name,
      patientId: t.patient.id,
      age: t.patient.age,
      gender: t.patient.gender,
      location: t.patient.location,
      severity: t.severity,
      symptoms: t.symptoms.slice(0, 4),
      createdAt: t.createdAt.toISOString(),
      sanitationRisk: assessSanitationRisk(t.symptoms),
    })),
  });
}
 
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "FOUNDATION_WORKER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
 
  try {
    const { patientId } = await req.json();
    if (!patientId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
    }
 
    // Create a follow-up check-in record for the patient
    const newTriage = await prisma.triage.create({
      data: {
        patientId,
        severity: "LOW",
        symptoms: ["Follow-up check-in completed by Foundation Worker"],
        vitals: { blood_sugar: 95, waist_size_inches: 32 },
        doctorBriefing: "Patient contacted and followed up successfully. Vitals stable.",
      },
    });
 
    return NextResponse.json({ success: true, triageId: newTriage.id });
  } catch (err) {
    console.error("Resolve follow-up error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
