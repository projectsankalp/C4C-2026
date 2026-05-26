import { SEVERITY_META } from "@/lib/format";

export function SeverityBadge({
  severity,
  size = "md",
}: {
  severity: string; // string (not strict SeverityTier) so legacy DB values render
  size?: "sm" | "md" | "lg";
}) {
  const meta =
    (SEVERITY_META as Record<string, (typeof SEVERITY_META)[keyof typeof SEVERITY_META]>)[
      severity
    ] ?? SEVERITY_META["LOW"];
  const sizes: Record<"sm" | "md" | "lg", string> = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };
  const dotColor: Record<string, string> = {
    LOW: "#16a34a",
    MODERATE: "#eab308",
    MEDIUM: "#eab308",
    HIGH: "#f97316",
    URGENT: "#dc2626",
    EMERGENCY: "#7f1d1d",
  };
  const isCritical = ["HIGH", "URGENT", "EMERGENCY"].includes(severity.toUpperCase());
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide ring-1 ring-inset ${meta.bg} ${meta.text} ${meta.ring} ${sizes[size]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isCritical ? "animate-pulse-ring" : ""}`}
        style={{ backgroundColor: dotColor[severity] ?? "#16a34a" }}
      />
      {meta.label}
    </span>
  );
}

