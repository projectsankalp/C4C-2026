import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const keysString = process.env.HF_API_KEYS || "";
    const keys = keysString.split(",").map(k => k.trim()).filter(k => k.length > 0);

    if (keys.length === 0) {
      return NextResponse.json({ error: "No Hugging Face API keys configured on the server." }, { status: 500 });
    }

    // Recommended fast & free model using the new HF Router
    const modelUrl = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";
    
    let lastError = null;

    // Multi-key rotation engine
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      console.log(`[HF Multi-Key Engine] Trying key ${i + 1} of ${keys.length}...`);

      try {
        const response = await fetch(modelUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        });

        if (response.ok) {
          console.log(`[HF Multi-Key Engine] Success using key ${i + 1}!`);
          const arrayBuffer = await response.arrayBuffer();
          
          return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
              "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
              "Cache-Control": "public, max-age=31536000, immutable"
            }
          });
        }

        const errText = await response.text();
        console.warn(`[HF Multi-Key Engine] Key ${i + 1} failed: HTTP ${response.status} - ${errText.substring(0, 100)}`);
        
        lastError = `HTTP ${response.status}: ${errText}`;
        
        // If the error is fatal (not rate limit or auth), maybe we shouldn't continue?
        // But the user requested robust rotation, so we continue on ANY error (429, 403, 503, etc.)
        continue;
        
      } catch (err: any) {
        console.warn(`[HF Multi-Key Engine] Key ${i + 1} encountered a network error:`, err.message);
        lastError = err.message;
        continue;
      }
    }

    // If we exit the loop, all keys failed
    console.error(`[HF Multi-Key Engine] All ${keys.length} keys exhausted. Last error: ${lastError}`);
    return NextResponse.json({ 
      error: "All API keys have exhausted their credits or failed. Please add more keys or try again later." 
    }, { status: 429 });

  } catch (err: any) {
    console.error("Image generation route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
