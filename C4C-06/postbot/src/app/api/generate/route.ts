import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function extractImageDescription(buffer: Buffer, mimeType: string): Promise<string> {
  const base64Image = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Describe what is happening in this image in detail. Focus on the core subject, text if any, and the overall context so it can be used to write a LinkedIn post about it." },
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
            },
          },
        ],
      },
    ],
    // We use the new multimodal Llama 4 Scout model from Groq
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.5,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "An image was attached but no description could be generated.";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const transcript = formData.get("transcript") as string | null;
    const currentText = formData.get("currentText") as string | null;
    const files = formData.getAll("files") as File[];

    let additionalContext = "";

    // Process files
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type;

      if (mimeType.startsWith("image/")) {
        const description = await extractImageDescription(buffer, mimeType);
        additionalContext += `\n[Image Attached] Description: ${description}\n`;
      } else if (mimeType === "application/pdf") {
        try {
          const pdfParse = require("pdf-parse");
          const data = await pdfParse(buffer);
          additionalContext += `\n[PDF Attached - Extracted Text]:\n${data.text}\n`;
        } catch (e) {
          console.error("PDF parse error:", e);
          additionalContext += `\n[PDF Attached - Failed to extract text]\n`;
        }
      } else if (mimeType.startsWith("video/")) {
         additionalContext += `\n[Video Attached - The user will upload a video file. Since video frame analysis is costly, rely solely on the user's text/voice context to write about the video].\n`;
      } else {
        // Assume text-based code file or raw text
        const text = buffer.toString("utf8");
        // Limit text length to avoid overflowing tokens
        const truncatedText = text.length > 5000 ? text.substring(0, 5000) + "...(truncated)" : text;
        additionalContext += `\n[File Attached: ${file.name}]:\n${truncatedText}\n`;
      }
    }

    if (!transcript && !currentText && additionalContext.trim() === "") {
      return NextResponse.json(
        { error: "No input provided." },
        { status: 400 }
      );
    }

    const lengthSetting = formData.get("length") as string || "medium";
    let lengthInstruction = "Keep it medium length, engaging and balanced.";
    if (lengthSetting === "short") lengthInstruction = "Keep it extremely short, punchy, and highly concise (under 3-4 sentences).";
    if (lengthSetting === "long") lengthInstruction = "Make it a long-form, deep-dive post with extensive detail, paragraphs, and a comprehensive narrative.";

    const prompt = `You are an expert social media manager and technical writer. Your task is to craft a crisp, highly engaging, professional LinkedIn post based on the provided inputs.
You have been provided with some notes, voice transcripts, and/or file contents from the user. 
Synthesize all this context into a polished LinkedIn post.

${lengthInstruction}

STRICT Formatting Rules:
1. NO MARKDOWN: LinkedIn does NOT support markdown formatting. Do NOT use **bold**, *italics*, or # headers. Write plain text only! Asterisks will ruin the post.
2. Title/Hook: Start with a powerful attention-grabber to set the stage for your post. (Again, do not use asterisks or bold).
3. Description: Write the main body of text. Provide details, insights, or your story here. Keep it crisp, value-driven, and properly spaced with line breaks. Include emojis naturally.
4. Visual Context: If an image/video is described in the context, weave that visual context seamlessly into the narrative.
5. Hashtags: Add 3-5 highly relevant hashtags at the bottom to expand reach.
6. Call to Action: Conclude with a clear call to action, like a thought-provoking question to encourage comments.

Use relevant, professional emojis appropriately throughout to make it visually appealing.

User Provided Context:
${transcript ? "Voice Transcript: " + transcript + "\n" : ""}
${currentText ? "Draft Text: " + currentText + "\n" : ""}
${additionalContext ? "Attached Files Context: " + additionalContext + "\n" : ""}

Format the output as ONLY the final post content ready to be copy-pasted. Do not include any meta-commentary like "Here is your post:".`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const generatedText = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({ text: generatedText });
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate post." },
      { status: 500 }
    );
  }
}
