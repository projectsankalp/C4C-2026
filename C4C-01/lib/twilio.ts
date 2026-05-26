import type { SeverityTier } from "@/lib/types";

interface TwilioCreds {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  toNumber: string;
}

function getCreds(): TwilioCreds | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const toNumber = process.env.EMERGENCY_ALERT_TO_NUMBER || "+916363640564";
  if (!accountSid || !authToken || !fromNumber) return null;
  return { accountSid, authToken, fromNumber, toNumber };
}

function authHeaders(creds: TwilioCreds) {
  const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString(
    "base64",
  );
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

async function placeCall(creds: TwilioCreds, twiml: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Calls.json`;
  const body = new URLSearchParams();
  body.append("To", creds.toNumber);
  body.append("From", creds.fromNumber);
  body.append("Twiml", twiml);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(creds),
      body,
    });
    if (!res.ok) {
      console.error("Twilio call failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Twilio call network error:", err);
  }
}

async function sendSms(creds: TwilioCreds, message: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Messages.json`;
  const body = new URLSearchParams();
  body.append("To", creds.toNumber);
  body.append("From", creds.fromNumber);
  body.append("Body", message);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(creds),
      body,
    });
    if (!res.ok) {
      console.error("Twilio SMS failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Twilio SMS network error:", err);
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function triggerEmergencyAlert(opts: {
  severity: SeverityTier;
  patientName: string;
  symptoms: string[];
  doctorBriefing?: string | null;
}) {
  if (opts.severity !== "URGENT" && opts.severity !== "EMERGENCY") return;
  const creds = getCreds();
  if (!creds) return;

  const heading =
    opts.severity === "EMERGENCY"
      ? "Emergency medical alert."
      : "Urgent medical alert.";
  const topSymptoms = opts.symptoms.slice(0, 3).join(", ") || "unspecified symptoms";
  const sayText = `${heading} Patient ${opts.patientName} has been triaged at ${opts.severity} severity. Reported symptoms include ${topSymptoms}. Please attend to the patient immediately.`;
  const twiml = `<Response><Say voice="alice">${escapeXml(sayText)}</Say><Pause length="1"/><Say voice="alice">${escapeXml(sayText)}</Say></Response>`;

  const smsParts = [
    `[${opts.severity}] MedAI emergency alert`,
    `Patient: ${opts.patientName}`,
    opts.symptoms.length ? `Symptoms: ${opts.symptoms.slice(0, 5).join(", ")}` : null,
    opts.doctorBriefing ? `Briefing: ${opts.doctorBriefing.slice(0, 240)}` : null,
    "Open the caregiver dashboard now.",
  ].filter(Boolean);
  const smsBody = smsParts.join(" | ");

  await Promise.all([placeCall(creds, twiml), sendSms(creds, smsBody)]);
}

export async function triggerReportNotification(opts: {
  extraction?: { symptoms?: string[]; modifiers?: string[] } | null;
  labFlags?: { flags?: { status?: string }[] } | null;
}) {
  const creds = getCreds();
  if (!creds) return;

  const twiml = `<Response><Say>Hello. Your medical report has been successfully processed and your summary is ready.</Say></Response>`;

  let summaryText = "MedAI Report Processed. ";
  let hasDetails = false;
  const symptoms = opts.extraction?.symptoms ?? [];
  const modifiers = opts.extraction?.modifiers ?? [];
  if (symptoms.length > 0) {
    summaryText += `Symptoms: ${symptoms.join(", ")}. `;
    hasDetails = true;
  }
  if (modifiers.length > 0) {
    summaryText += `Notes: ${modifiers.join(", ")}. `;
    hasDetails = true;
  }
  const flags = opts.labFlags?.flags ?? [];
  if (flags.length > 0) {
    const abnormal = flags.filter(
      (f) => f.status && f.status !== "normal",
    ).length;
    summaryText += `Labs: ${flags.length} checked, ${abnormal} abnormal. `;
    hasDetails = true;
  }
  if (!hasDetails) {
    summaryText += "No specific symptoms or abnormal lab values flagged. ";
  }
  summaryText += "View full details on your dashboard.";

  await Promise.all([placeCall(creds, twiml), sendSms(creds, summaryText)]);
}

export async function triggerFollowUpMissedAlert(patientName: string) {
  const creds = getCreds();
  if (!creds) return;

  const sayText = `Follow up of patient ${patientName} has been missed.`;
  const twiml = `<Response><Say voice="alice">${escapeXml(sayText)}</Say><Pause length="1"/><Say voice="alice">${escapeXml(sayText)}</Say></Response>`;
  const smsBody = `Follow-up Alert: The follow-up for patient ${patientName} has been missed. Please check the surveillance dashboard.`;

  await Promise.all([placeCall(creds, twiml), sendSms(creds, smsBody)]);
}
