import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Pool } from "pg";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paramsData = await params;
    const { id } = paramsData;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 1. Fetch Post
    const { rows: posts } = await pool.query(`SELECT * FROM "Post" WHERE id = $1 AND "userId" = $2`, [id, session.user.id]);
    const post = posts[0];
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.status !== 'PENDING') return NextResponse.json({ error: "Post is already published or failed" }, { status: 400 });

    // 2. Fetch User Account Token
    const { rows: accounts } = await pool.query(`SELECT access_token, "providerAccountId" FROM "Account" WHERE "userId" = $1 AND provider = 'linkedin' LIMIT 1`, [session.user.id]);
    const account = accounts[0];
    if (!account) return NextResponse.json({ error: "LinkedIn account not found" }, { status: 400 });

    // 3. Publish to LinkedIn
    const urns = post.mediaUrns || [];
    const authorUrn = `urn:li:person:${account.providerAccountId}`;

    let postPayload: any = {
      author: authorUrn,
      commentary: post.content,
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false
    };

    if (urns.length > 1) {
      postPayload.content = { multiImage: { images: urns.map((urn: string) => ({ id: urn })) } };
    } else if (urns.length === 1) {
      postPayload.content = { media: { id: urns[0] } };
    }

    const linkedinRes = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${account.access_token}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202604",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(postPayload)
    });

    if (!linkedinRes.ok) {
      const errText = await linkedinRes.text();
      throw new Error(`LinkedIn API Error: ${errText}`);
    }

    // 4. Mark as Published
    await pool.query(`UPDATE "Post" SET status = 'PUBLISHED', "publishedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Publish Now error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
