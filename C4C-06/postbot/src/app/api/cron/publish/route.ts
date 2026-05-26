import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET(req: NextRequest) {
  try {
    // In production, you would want to secure this route using a Cron Secret
    // e.g. if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) return 401
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Find all PENDING posts whose scheduled time is now or in the past
    const { rows: postsToPublish } = await pool.query(`
      SELECT * FROM "Post" 
      WHERE "status" = 'PENDING' 
      AND "scheduledAt" <= NOW()
    `);

    if (postsToPublish.length === 0) {
      return NextResponse.json({ message: "No posts to publish" });
    }

    const results = [];

    for (const post of postsToPublish) {
      try {
        // Fetch the user's LinkedIn access token from the database
        const { rows: accounts } = await pool.query(`
          SELECT access_token FROM "Account"
          WHERE "userId" = $1 AND provider = 'linkedin'
          LIMIT 1
        `, [post.userId]);

        const account = accounts[0];
        if (!account || !account.access_token) {
          throw new Error("No LinkedIn account linked for this user");
        }

        const token = account.access_token;
        const urns = post.mediaUrns || [];

        // Determine if it's a multi-image carousel or single image/text
        let specificContent: any = {};
        
        if (urns.length > 1) {
          specificContent = {
            "multiImage": {
              "images": urns.map((urn: string) => ({ "id": urn }))
            }
          };
        } else if (urns.length === 1) {
          specificContent = {
            "media": [
              {
                "id": urns[0],
                "altText": "Media attachment"
              }
            ]
          };
        }

        const payload = {
          "author": "urn:li:person:" + account.providerAccountId, // Wait, we need the providerAccountId which is the LinkedIn Person URN ID!
          "lifecycleState": "PUBLISHED",
          "specificContent": {
            "com.linkedin.ugc.ShareContent": {
              "shareCommentary": {
                "text": post.content
              },
              "shareMediaCategory": urns.length === 0 ? "NONE" : (urns.length > 1 ? "IMAGE" : (urns[0].includes("video") ? "VIDEO" : "IMAGE")),
              "media": urns.map((urn: string) => ({ "status": "READY", "media": urn }))
            }
          },
          "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
          }
        };

        // Wait, the ugcPosts API is the older v2 API, but we've been using `/rest/posts` in our other route!
        // Let's use the exact same REST API we used in `/api/publish/linkedin/route.ts` to guarantee success!

        // Fetch providerAccountId to build the URN
        const { rows: pAccounts } = await pool.query(`
          SELECT "providerAccountId" FROM "Account"
          WHERE "userId" = $1 AND provider = 'linkedin'
        `, [post.userId]);
        const authorUrn = `urn:li:person:${pAccounts[0].providerAccountId}`;

        let postPayload: any = {
          author: authorUrn,
          commentary: post.content,
          visibility: "PUBLIC",
          distribution: {
            feedDistribution: "MAIN_FEED",
            targetEntities: [],
            thirdPartyDistributionChannels: []
          },
          lifecycleState: "PUBLISHED",
          isReshareDisabledByAuthor: false
        };

        if (urns.length > 1) {
          postPayload.content = {
            multiImage: {
              images: urns.map((urn: string) => ({ id: urn }))
            }
          };
        } else if (urns.length === 1) {
          postPayload.content = {
            media: {
              id: urns[0]
            }
          };
        }

        const response = await fetch("https://api.linkedin.com/rest/posts", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "LinkedIn-Version": "202604",
            "X-Restli-Protocol-Version": "2.0.0"
          },
          body: JSON.stringify(postPayload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.error("LinkedIn Cron Publish Error:", errData);
          throw new Error(errData.message || "Failed to publish to LinkedIn API");
        }

        // Mark as PUBLISHED in DB
        await pool.query(`
          UPDATE "Post" 
          SET status = 'PUBLISHED', "publishedAt" = NOW(), "updatedAt" = NOW()
          WHERE id = $1
        `, [post.id]);

        results.push({ id: post.id, status: "success" });
      } catch (err: any) {
        console.error(`Cron failed for post ${post.id}:`, err);
        // Mark as FAILED
        await pool.query(`
          UPDATE "Post" 
          SET status = 'FAILED', "updatedAt" = NOW()
          WHERE id = $1
        `, [post.id]);
        
        results.push({ id: post.id, status: "failed", error: err.message });
      }
    }

    return NextResponse.json({ processed: postsToPublish.length, results });
  } catch (error: any) {
    console.error("Cron master error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
