import type { SeverityTier } from "@/lib/types";

export type Pathway = "EMERGENCY" | "OPD" | "TELECONSULT";

export interface ArrivalWindow {
  pathway: Pathway;
  startIso: string;
  endIso: string;
  label: string;
  description: string;
}

const OPD_OPEN_HOUR = 9;
const OPD_CLOSE_HOUR = 17;
const AVG_CONSULT_MINUTES = 12;
const BUFFER_MINUTES = 30;
const SLOT_LENGTH_MINUTES = 15;

export function pathwayFor(severity: SeverityTier): Pathway {
  if (severity === "EMERGENCY" || severity === "URGENT") return "EMERGENCY";
  if (severity === "LOW") return "TELECONSULT";
  return "OPD";
}

function formatHM(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function roundDownToSlot(d: Date) {
  d.setMinutes(Math.floor(d.getMinutes() / SLOT_LENGTH_MINUTES) * SLOT_LENGTH_MINUTES);
  d.setSeconds(0);
  d.setMilliseconds(0);
}

export function computeArrivalWindow(
  severity: SeverityTier,
  queueAhead: number,
  now: Date = new Date(),
): ArrivalWindow {
  const pathway = pathwayFor(severity);

  if (pathway === "EMERGENCY") {
    const start = new Date(now);
    const end = new Date(now.getTime() + SLOT_LENGTH_MINUTES * 60_000);
    return {
      pathway,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      label: "Come now",
      description:
        "Walk in immediately. The OPD desk has been notified — you skip the queue and are seen first.",
    };
  }

  if (pathway === "TELECONSULT") {
    const start = new Date(now);
    const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return {
      pathway,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      label: "No hospital visit required",
      description:
        "Your symptoms are mild. Skip the queue — use teleconsult or the self-care guidance below.",
    };
  }

  const opdOpen = new Date(now);
  opdOpen.setHours(OPD_OPEN_HOUR, 0, 0, 0);
  const opdClose = new Date(now);
  opdClose.setHours(OPD_CLOSE_HOUR, 0, 0, 0);

  const effectiveAhead = severity === "MODERATE" ? Math.floor(queueAhead / 2) : queueAhead;
  const earliestByQueue = new Date(
    opdOpen.getTime() + effectiveAhead * AVG_CONSULT_MINUTES * 60_000,
  );
  const earliestByBuffer = new Date(now.getTime() + BUFFER_MINUTES * 60_000);
  const start =
    earliestByQueue > earliestByBuffer ? earliestByQueue : earliestByBuffer;
  roundDownToSlot(start);

  if (start > opdClose) {
    start.setDate(start.getDate() + 1);
    start.setHours(OPD_OPEN_HOUR, 0, 0, 0);
  }

  const end = new Date(start.getTime() + SLOT_LENGTH_MINUTES * 60_000);
  const dayStr =
    start.toDateString() === now.toDateString() ? "today" : "tomorrow";
  const label = `${formatHM(start)} – ${formatHM(end)} ${dayStr}`;
  const description =
    severity === "MODERATE"
      ? "Same-day priority slot — paperwork already on file. Arrive in this 15-minute window."
      : "Standard slot. Arrive in this 15-minute window to skip the morning rush.";

  return {
    pathway,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    label,
    description,
  };
}
