import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data — send multipart/form-data with a 'file' field." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' field." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${Math.round(file.size / 1024 / 1024)} MB). Max 10 MB.` },
      { status: 413 },
    );
  }

  const isPdfMime = file.type === "application/pdf";
  const isPdfExt = file.name.toLowerCase().endsWith(".pdf");
  if (!isPdfMime && !isPdfExt) {
    return NextResponse.json(
      { error: "Only PDF files are supported here. For images, paste the text directly." },
      { status: 415 },
    );
  }

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text, totalPages } = await extractText(pdf, { mergePages: true });
    const cleaned = String(text)
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (cleaned.length < 10) {
      return NextResponse.json(
        {
          error:
            "PDF parsed but contained almost no text — it may be a scanned image. Paste the text manually.",
          pages: totalPages,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      text: cleaned,
      pages: totalPages,
      filename: file.name,
      size: file.size,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to read PDF: ${e instanceof Error ? e.message : "unknown error"}` },
      { status: 500 },
    );
  }
}
