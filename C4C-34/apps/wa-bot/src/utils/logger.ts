/**
 * Tiny structured logger so demo terminals stay readable.
 * Avoids pulling in a heavy dependency and gives every line a timestamp + event tag.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

const LEVEL_ICONS: Record<LogLevel, string> = {
  info: "ℹ️ ",
  warn: "⚠️ ",
  error: "❌",
  debug: "🔎",
};

function maskPhone(phone: string): string {
  // Keep the first 4 and last 3 digits, mask the middle.
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 4)}****${digits.slice(-3)}`;
}

function format(level: LogLevel, event: string, data?: Record<string, unknown>) {
  const ts = new Date().toISOString();
  const safeData = data
    ? Object.fromEntries(
        Object.entries(data).map(([k, v]) => {
          if (k === "phone" || k === "to" || k === "from") {
            return [k, typeof v === "string" ? maskPhone(v) : v];
          }
          return [k, v];
        }),
      )
    : undefined;
  const tail = safeData ? ` ${JSON.stringify(safeData)}` : "";
  return `${LEVEL_ICONS[level]} [${ts}] ${event}${tail}`;
}

export const log = {
  info(event: string, data?: Record<string, unknown>) {
    console.log(format("info", event, data));
  },
  warn(event: string, data?: Record<string, unknown>) {
    console.warn(format("warn", event, data));
  },
  error(event: string, data?: Record<string, unknown>) {
    console.error(format("error", event, data));
  },
  debug(event: string, data?: Record<string, unknown>) {
    if (process.env.DEBUG === "true") {
      console.log(format("debug", event, data));
    }
  },
  maskPhone,
};
