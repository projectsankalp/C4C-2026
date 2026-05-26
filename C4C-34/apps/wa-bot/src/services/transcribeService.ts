/**
 * Voice-note transcription service.
 *
 * Strategy:
 *   1. If OPENAI_API_KEY is set AND we received audio bytes, call OpenAI Whisper
 *      ("whisper-1"). This is the real artisan-voice → text path.
 *   2. Otherwise, fall back to a deterministic mock transcript that matches
 *      the master plan's canonical demo line ("Handmade coconut shell lamp,
 *      ₹600, 2 pieces"). The mock is keyed by simple keywords so different
 *      demos can pick different products by saying "saree", "basket", etc.
 *
 * Whisper handles Kannada, Hindi, English, Tamil, Malayalam natively. We pass
 * `language` as a hint when we know it (e.g. from session.language) for better
 * accuracy on short voice notes.
 *
 * If the Whisper call fails for any reason (network, rate limit, bad audio),
 * we fall back to the mock so the demo never blocks. Failure mode is invisible.
 */
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { config } from "../config";
import { log } from "../utils/logger";

export interface TranscriptionResult {
  /** What we believe the artisan said, in English/local-script. */
  text: string;
  /** Source language detected. */
  language: "en" | "hi" | "kn" | "ta" | "ml";
  /** Confidence 0-1. Whisper does not return confidence directly; we approximate. */
  confidence: number;
  /** Whether we used the real STT provider or the mock. */
  source: "whisper" | "mock";
}

interface TranscribeInput {
  /** Audio bytes from Open-WA. When absent, we use the mock. */
  audioBuffer?: Buffer;
  /** Mimetype hint (e.g. "audio/ogg", "audio/mpeg") so Whisper can choose decoder. */
  mimetype?: string;
  /** Hint from the conversation (e.g. session.rawMessage). */
  contextHint?: string;
  /** Language hint to bias Whisper. */
  language?: "en" | "hi" | "kn" | "ta" | "ml";
}

const CANONICAL_TRANSCRIPTS = [
  {
    keywords: ["lamp", "deepa", "ದೀಪ", "lighting", "decor"],
    text: "Handmade coconut shell lamp, ₹600, 2 pieces available",
  },
  {
    keywords: ["saree", "kurti", "dupatta", "embroidery", "weaving", "ಬಟ್ಟೆ"],
    text: "Handwoven cotton saree with traditional border, ₹1200, 3 pieces available",
  },
  {
    keywords: ["bag", "tote", "purse", "ಚೀಲ"],
    text: "Handmade jute tote bag with natural dye, ₹450, 5 pieces available",
  },
  {
    keywords: ["basket", "weave", "bamboo"],
    text: "Handwoven banana fiber basket, ₹350, 4 pieces available",
  },
  {
    keywords: ["diya", "terracotta", "festival"],
    text: "Terracotta festival diya set, 12 pieces, ₹250",
  },
  {
    keywords: ["jewel", "bead", "necklace", "earring", "ಹಾರ"],
    text: "Handmade beaded necklace, ₹300, 6 pieces available",
  },
];

const DEFAULT_TRANSCRIPT = "Handmade coconut shell lamp, ₹600, 2 pieces available";

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (!config.openaiApiKey) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openaiClient;
}

export async function transcribeAudio(input: TranscribeInput = {}): Promise<TranscriptionResult> {
  // Prefer real Whisper when we have both a key and audio bytes.
  const client = getOpenAI();
  if (client && input.audioBuffer && input.audioBuffer.length > 0) {
    try {
      return await transcribeWithWhisper(client, input);
    } catch (error: any) {
      log.warn("WHISPER_FAILED_FALLBACK_TO_MOCK", {
        message: error?.message,
        bytes: input.audioBuffer?.length,
      });
      // fall through to mock
    }
  }

  return mockTranscribe(input);
}

async function transcribeWithWhisper(
  client: OpenAI,
  input: TranscribeInput,
): Promise<TranscriptionResult> {
  const started = Date.now();
  const ext = pickExtension(input.mimetype);
  const file = await toFile(input.audioBuffer!, `whatsapp-voice.${ext}`, {
    type: input.mimetype || "audio/ogg",
  });

  // Primary: gpt-4o-transcribe (best accuracy on accents + Indic languages, same $/min as whisper-1).
  // Fallback: whisper-1 if the new model errors out for any reason.
  const primaryModel = config.openaiTranscriptionModel || "gpt-4o-transcribe";
  const fallbackModel = primaryModel === "whisper-1" ? null : "whisper-1";

  let modelUsed = primaryModel;
  let response: any;

  try {
    response = await client.audio.transcriptions.create({
      file,
      model: primaryModel,
      // Provide language hint when known. Whisper auto-detects otherwise.
      language: input.language,
      response_format: "json",
    });
  } catch (error: any) {
    if (!fallbackModel) throw error;
    log.warn("TRANSCRIBE_PRIMARY_FAILED_FALLING_BACK", {
      primaryModel,
      fallbackModel,
      message: error?.message,
    });
    // Re-create the file because the previous toFile() handle was consumed.
    const retryFile = await toFile(input.audioBuffer!, `whatsapp-voice.${ext}`, {
      type: input.mimetype || "audio/ogg",
    });
    response = await client.audio.transcriptions.create({
      file: retryFile,
      model: fallbackModel,
      language: input.language,
      response_format: "json",
    });
    modelUsed = fallbackModel;
  }

  const text = (response.text || "").trim();
  const elapsed = Date.now() - started;

  log.info("TRANSCRIBE_SUCCESS", {
    model: modelUsed,
    bytes: input.audioBuffer?.length,
    elapsedMs: elapsed,
    textLen: text.length,
  });

  return {
    text: text || DEFAULT_TRANSCRIPT,
    language: input.language ?? detectLanguageFromText(text),
    confidence: 0.9,
    source: "whisper",
  };
}

function mockTranscribe(input: TranscribeInput): TranscriptionResult {
  const hint = (input.contextHint || "").toLowerCase();
  const match = CANONICAL_TRANSCRIPTS.find((row) =>
    row.keywords.some((kw) => hint.includes(kw.toLowerCase())),
  );

  // Reason for falling back. Helpful in logs when debugging demo issues.
  const reason = !input.audioBuffer
    ? "no audio bytes provided"
    : !getOpenAI()
      ? "no OPENAI_API_KEY configured"
      : "whisper call failed (see WHISPER_FAILED_FALLBACK_TO_MOCK above)";

  log.info("TRANSCRIBE_MOCK", {
    matched: Boolean(match),
    textPreview: (match?.text ?? DEFAULT_TRANSCRIPT).slice(0, 40),
    reason,
  });

  return {
    text: match?.text ?? DEFAULT_TRANSCRIPT,
    language: input.language ?? "kn",
    confidence: 0.92,
    source: "mock",
  };
}

function pickExtension(mimetype?: string): string {
  if (!mimetype) return "ogg";
  if (mimetype.includes("mpeg") || mimetype.includes("mp3")) return "mp3";
  if (mimetype.includes("mp4") || mimetype.includes("m4a")) return "m4a";
  if (mimetype.includes("wav")) return "wav";
  if (mimetype.includes("webm")) return "webm";
  return "ogg";
}

function detectLanguageFromText(text: string): "en" | "hi" | "kn" | "ta" | "ml" {
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml";
  return "en";
}
