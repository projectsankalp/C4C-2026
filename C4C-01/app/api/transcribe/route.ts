import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024;
const ASSEMBLY_BASE = "https://api.assemblyai.com/v2";

export async function POST(req: Request) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Send multipart/form-data with an 'audio' field." },
      { status: 400 },
    );
  }

  const audio = form.get("audio");
  const language = String(form.get("language") ?? "en");
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Missing 'audio' field." }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Audio too large (${Math.round(audio.size / 1024 / 1024)} MB). Max 25 MB.` },
      { status: 413 },
    );
  }
  if (audio.size < 100) {
    return NextResponse.json(
      { error: "Audio is empty. Did you actually record something?" },
      { status: 400 },
    );
  }

  try {
    const upload = await fetch(`${ASSEMBLY_BASE}/upload`, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/octet-stream",
      },
      body: await audio.arrayBuffer(),
    });
    if (!upload.ok) {
      const t = await upload.text();
      return NextResponse.json(
        { error: `AssemblyAI upload failed: ${upload.status} ${t.slice(0, 200)}` },
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
    if (language === "auto") {
      reqBody.language_detection = true;
    } else {
      reqBody.language_code = language;
    }
    const create = await fetch(`${ASSEMBLY_BASE}/transcript`, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });
    if (!create.ok) {
      const t = await create.text();
      return NextResponse.json(
        { error: `AssemblyAI transcript create failed: ${create.status} ${t.slice(0, 200)}` },
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
        { error: last.error ?? `Transcription timed out (status: ${last.status ?? "unknown"})` },
        { status: 504 },
      );
    }

    return NextResponse.json({
      transcript: last.text ?? "",
      transcript_id: id,
      language,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Transcription error: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 500 },
    );
  }
}
