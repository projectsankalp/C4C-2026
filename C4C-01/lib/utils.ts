/**
 * General utility helper functions for the PulsePoint Web application.
 */

/**
 * Conditional class joining utility.
 */
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a date string or timestamp to a readable Indian Standard format.
 */
export function formatDate(date: Date | string | number): string {
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return "Invalid Date";
  }
}

/**
 * Format a date string or timestamp to a readable time format.
 */
export function formatTime(date: Date | string | number): string {
  try {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "";
  }
}

/**
 * Truncate long text strings with ellipses.
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Get color code for severity level.
 */
export function getSeverityTheme(severity: string) {
  const normalized = severity?.toUpperCase() || "LOW";
  switch (normalized) {
    case "EMERGENCY":
      return {
        text: "#7f1d1d",
        bg: "#fee2e2",
        border: "#fca5a5"
      };
    case "URGENT":
      return {
        text: "#9a3412",
        bg: "#ffedd5",
        border: "#fdba74"
      };
    case "MODERATE":
    case "MEDIUM":
      return {
        text: "#854d0e",
        bg: "#fef9c3",
        border: "#fde047"
      };
    default:
      return {
        text: "#166534",
        bg: "#dcfce7",
        border: "#86efac"
      };
  }
}
