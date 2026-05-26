import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, ReportKind, Role } from "@prisma/client";
import { extractText, getDocumentProxy } from "unpdf";
import { extractSymptoms } from "@/lib/symptom-extract";
import { triggerReportNotification } from "@/lib/twilio";

const HF_BASE = (
  process.env.NEXT_PUBLIC_PULSEPOINT_API ||
  "https://aviraltrip-pulsepoint-ai.hf.space"
).replace(/\/$/, "");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024;
const ASSEMBLY_BASE = "https://api.assemblyai.com/v2";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    if (session.user.role !== Role.PATIENT) {
      return NextResponse.json(
        { error: "Patient role required" },
        { status: 403 },
      );
    }
    const reports = await prisma.report.findMany({
      where: { patientId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ reports });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    const isDbDown =
      /P1001|P1017|connect ECONNREFUSED|reach database/i.test(msg);
    return NextResponse.json(
      {
        error: isDbDown
          ? "Database is waking up (Neon free-tier cold-start). Try again in 5–10 seconds."
          : `Failed to load reports: ${msg}`,
      },
      { status: isDbDown ? 503 : 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    if (session.user.role !== Role.PATIENT) {
      return NextResponse.json(
        { error: "Patient role required" },
        { status: 403 },
      );
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Send multipart/form-data with a 'file' or 'audio' field." },
        { status: 400 },
      );
    }

    const pdf = form.get("file");
    const audio = form.get("audio");
    const language = String(form.get("language") ?? "en");

    if (pdf instanceof File) {
      const u = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { age: true, gender: true },
      });
      return handlePdf(pdf, session.user.id, u?.age ?? null, u?.gender ?? null);
    }
    if (audio instanceof File) {
      return handleAudio(audio, language, session.user.id);
    }
    return NextResponse.json(
      { error: "Provide either a 'file' (PDF) or 'audio' (recording)." },
      { status: 400 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    const isDbDown =
      /P1001|P1017|connect ECONNREFUSED|reach database/i.test(msg);
    return NextResponse.json(
      {
        error: isDbDown
          ? "Database is waking up (Neon cold-start). Try again in 5–10 seconds."
          : `Upload failed: ${msg}`,
      },
      { status: isDbDown ? 503 : 500 },
    );
  }
}

async function handlePdf(
  file: File,
  patientId: string,
  age?: number | null,
  gender?: string | null,
) {
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (>25 MB)." }, { status: 413 });
  }
  if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json(
      { error: "Only PDF files are accepted." },
      { status: 415 },
    );
  }
  let text: string;
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const proxy = await getDocumentProxy(buffer);
    const out = await extractText(proxy, { mergePages: true });
    text = String(out.text)
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch (e) {
    return NextResponse.json(
      { error: `PDF parse failed: ${(e as Error).message}` },
      { status: 422 },
    );
  }
  if (text.length < 10) {
    return NextResponse.json(
      {
        error:
          "PDF parsed but contained almost no text — it may be a scanned image. Try a different file.",
      },
      { status: 422 },
    );
  }

  const extraction = extractSymptoms(text);

  let labFlags: unknown = null;
  const looksLikeLab = /\b(hb|haemoglobin|wbc|rbc|platelet|glucose|hba1c|creatinine|cholesterol|ldl|hdl|tsh|t3|t4|sgpt|sgot|albumin)\b/i.test(
    text,
  );
  if (looksLikeLab && age != null && gender) {
    try {
      const ctrl = AbortSignal.timeout(45_000);
      const resp = await fetch(`${HF_BASE}/api/v1/predict/labs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ocr_text: text.slice(0, 8000),
          age,
          gender,
        }),
        signal: ctrl,
      });
      if (resp.ok) {
        labFlags = await resp.json();
      }
    } catch {
      // engine offline / cold start — non-fatal
    }
  }

  const report = await prisma.report.create({
    data: {
      patientId,
      kind: ReportKind.PDF,
      filename: file.name,
      rawText: text.slice(0, 50_000),
      symptoms: extraction.symptoms,
      modifiers: extraction.modifiers,
      labFlags:
        labFlags === null || labFlags === undefined
          ? Prisma.JsonNull
          : (labFlags as Prisma.InputJsonValue),
      language: "en",
    },
  });

  triggerReportNotification({ extraction, labFlags: labFlags as { flags?: { status?: string }[] } | null }).catch(console.error);

  return NextResponse.json({ report, extraction, labFlags });
}

async function handleAudio(file: File, language: string, patientId: string) {
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Audio too large (>25 MB)." }, { status: 413 });
  }
  if (file.size < 100) {
    return NextResponse.json(
      { error: "Audio is empty. Did you actually record something?" },
      { status: 400 },
    );
  }
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_API_KEY not configured." },
      { status: 500 },
    );
  }

  try {
    const upload = await fetch(`${ASSEMBLY_BASE}/upload`, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/octet-stream",
      },
      body: await file.arrayBuffer(),
    });
    if (!upload.ok) {
      const t = await upload.text();
      return NextResponse.json(
        { error: `AssemblyAI upload: ${upload.status} ${t.slice(0, 200)}` },
        { status: 502 },
      );
    }
    const { upload_url } = (await upload.json()) as { upload_url: string };

    const reqBody: Record<string, unknown> = {
      audio_url: upload_url,
      punctuate: true,
      format_text: true,
      speech_models: ["universal-3-pro"],
    };
    if (language === "auto") reqBody.language_detection = true;
    else reqBody.language_code = language;

    const create = await fetch(`${ASSEMBLY_BASE}/transcript`, {
      method: "POST",
      headers: { authorization: apiKey, "content-type": "application/json" },
      body: JSON.stringify(reqBody),
    });
    if (!create.ok) {
      const t = await create.text();
      return NextResponse.json(
        { error: `AssemblyAI create: ${create.status} ${t.slice(0, 200)}` },
        { status: 502 },
      );
    }
    const { id } = (await create.json()) as { id: string };

    const deadline = Date.now() + 90_000;
    let last: { status?: string; text?: string; error?: string } = {};
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 1500));
      const poll = await fetch(`${ASSEMBLY_BASE}/transcript/${id}`, {
        headers: { authorization: apiKey },
      });
      if (!poll.ok) continue;
      last = await poll.json();
      if (last.status === "completed" || last.status === "error") break;
    }
    if (last.status !== "completed") {
      return NextResponse.json(
        { error: last.error ?? `Transcription timed out (${last.status ?? "unknown"})` },
        { status: 504 },
      );
    }

    const transcript = last.text ?? "";
    const extraction = extractSymptoms(transcript);

    const report = await prisma.report.create({
      data: {
        patientId,
        kind: ReportKind.VOICE,
        filename: file.name || "voice-note.webm",
        rawText: transcript.slice(0, 50_000),
        symptoms: extraction.symptoms,
        modifiers: extraction.modifiers,
        labFlags: Prisma.JsonNull,
        language,
      },
    });

    triggerReportNotification({ extraction }).catch(console.error);

    return NextResponse.json({ report, extraction });
  } catch (e) {
    return NextResponse.json(
      { error: `Audio processing failed: ${(e as Error).message}` },
      { status: 500 },
    );
  }
}
