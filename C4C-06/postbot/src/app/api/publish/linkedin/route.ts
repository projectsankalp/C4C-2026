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

    const { content, mediaUrns = [] } = await req.json();

    if (!content && mediaUrns.length === 0) {
      return NextResponse.json({ error: "Content or media is required to publish." }, { status: 400 });
    }

    // 1. Get user's LinkedIn access token from the database
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "linkedin" }
    });

    if (!account || !account.access_token) {
      return NextResponse.json({ error: "LinkedIn account not connected or missing access token." }, { status: 400 });
    }

    // 2. Fetch LinkedIn Profile to get the author URN
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${account.access_token}` }
    });
    
    if (!profileRes.ok) throw new Error("Failed to fetch LinkedIn profile information.");
    
    const profileData = await profileRes.json();
    const authorUrn = `urn:li:person:${profileData.sub}`;

    // 3. Prepare the new LinkedIn /rest/posts API payload
    const postBody: any = {
      author: authorUrn,
      commentary: content || "",
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    };

    // Attach media if provided (Using the modern Posts API syntax)
    if (mediaUrns.length > 0) {
      if (mediaUrns.length === 1) {
        postBody.content = {
          media: {
            id: mediaUrns[0]
          }
        };
      } else {
        // MultiImage format for grids/carousels
        postBody.content = {
          multiImage: {
            images: mediaUrns.map((urn: string) => ({ id: urn }))
          }
        };
      }
    }

    // 4. Publish the post
    const postRes = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${account.access_token}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202604", 
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(postBody)
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      console.error("LinkedIn Post Error:", errText);
      throw new Error(`LinkedIn API Error: ${errText}`);
    }

    // For POST requests, LinkedIn returns a 201 Created and the ID in the headers, or an empty JSON
    return NextResponse.json({ success: true, message: "Successfully published to LinkedIn!" });
  } catch (err: any) {
    console.error("Publishing error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
