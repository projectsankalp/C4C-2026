import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import fs from "fs";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided." },
        { status: 400 }
      );
    }

    // Convert the File to a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save buffer to a temporary file because groq-sdk expects a fs.ReadStream
    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}-${file.name || 'audio.webm'}`);
    fs.writeFileSync(tempFilePath, buffer);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3",
      response_format: "json",
      temperature: 0.0,
    });

    // Cleanup the temp file
    fs.unlinkSync(tempFilePath);

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to transcribe audio." },
      { status: 500 }
    );
  }
}
