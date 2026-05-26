import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileType } = await req.json();

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "linkedin" }
    });

    if (!account || !account.access_token) {
      return NextResponse.json({ error: "LinkedIn account not connected." }, { status: 400 });
    }

    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${account.access_token}` }
    });
    
    if (!profileRes.ok) throw new Error("Failed to fetch LinkedIn profile information.");
    
    const profileData = await profileRes.json();
    const authorUrn = `urn:li:person:${profileData.sub}`;

    let recipe = "urn:li:digitalmediaRecipe:feedshare-image";
    let mediaType = "image";
    
    if (fileType && fileType.startsWith("video/")) {
      recipe = "urn:li:digitalmediaRecipe:feedshare-video";
      mediaType = "video";
    }

    // Call LinkedIn Assets API to register upload
    const registerBody = {
      registerUploadRequest: {
        recipes: [recipe],
        owner: authorUrn,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent"
          }
        ]
      }
    };

    const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${account.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerBody)
    });

    if (!registerRes.ok) {
      const errText = await registerRes.text();
      console.error("LinkedIn Asset Register Error:", errText);
      throw new Error(`LinkedIn Media API Error: ${errText}`);
    }

    const registerData = await registerRes.json();
    
    // Extract upload URL and raw asset URN
    const uploadMechanism = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"];
    const uploadUrl = uploadMechanism.uploadUrl;
    const rawAssetUrn = registerData.value.asset;
    
    // The new /rest/posts API requires the URN to be formatted as urn:li:image:{id} or urn:li:video:{id}
    const assetUrn = rawAssetUrn.replace("digitalmediaAsset", mediaType);

    return NextResponse.json({ uploadUrl, assetUrn, mediaType });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
