import { NextResponse } from "next/server";
import { extractSymptoms } from "@/lib/symptom-extract";
import { api } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = String(body.text ?? "").slice(0, 20_000);
  if (text.trim().length < 3) {
    return NextResponse.json(
      { error: "Need at least a few characters of text to extract from." },
      { status: 400 },
    );
  }

  try {
    // 1. Run local extractor for baseline recall
    const localResult = extractSymptoms(text);

    // 2. Query Hugging Face ML model for negation and positive symptom detection
    const hfRes = await api.symptomsFromText({ text });

    // 3. Create set of negated symptoms to filter them out
    const negatedCanonical = new Set(
      (hfRes.negated || []).map(s => s.toLowerCase().replace(/_/g, " "))
    );

    // Map matched phrases to canonical names for negation checking
    const negatedPhrases = new Set(
      (hfRes.matches || [])
        .filter(m => m.negated)
        .map(m => m.phrase.toLowerCase())
    );

    // 4. Filter out any local symptoms that are negated by the ML model
    const filteredSymptoms = localResult.symptoms.filter(symptom => {
      // Check if canonical matches
      if (negatedCanonical.has(symptom.toLowerCase())) return false;
      
      // Check if any matched phrase for this symptom is in the negated phrases list
      const spansForSymptom = localResult.spans.filter(sp => sp.symptom === symptom);
      for (const sp of spansForSymptom) {
        if (negatedPhrases.has(sp.token.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    // Also include any positive symptoms identified by the ML model
    const positiveCanonicalMapped = (hfRes.symptoms || []).map(s => s.replace(/_/g, " "));
    const finalSymptoms = Array.from(new Set([...filteredSymptoms, ...positiveCanonicalMapped]));

    // Filter spans to match final symptoms
    const finalSpans = localResult.spans.filter(sp => finalSymptoms.includes(sp.symptom));

    return NextResponse.json({
      symptoms: finalSymptoms,
      modifiers: localResult.modifiers || [],
      spans: finalSpans,
      raw_length: text.length,
    });
  } catch (e) {
    console.error("[PulsePoint] HF symptomsFromText failed, falling back to local extractor only:", e);
    // Safe fallback to rule-based extractor
    const result = extractSymptoms(text);
    return NextResponse.json(result);
  }
}
