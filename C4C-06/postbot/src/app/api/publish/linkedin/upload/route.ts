import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const uploadUrl = formData.get("uploadUrl") as string;

    if (!file || !uploadUrl) {
      return NextResponse.json({ error: "File and uploadUrl are required" }, { status: 400 });
    }

    // Convert the File to a Buffer/ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Make the PUT request directly from the server to bypass browser CORS
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: buffer,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("LinkedIn direct upload failed:", errText);
      throw new Error(`Failed to upload media to LinkedIn: ${errText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("LinkedIn upload proxy error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
