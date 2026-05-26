import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Pool } from "pg";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, mediaUrns, scheduledAt, platform } = await req.json();

    if (!content && (!mediaUrns || mediaUrns.length === 0)) {
      return NextResponse.json({ error: "Post must contain content or media" }, { status: 400 });
    }

    if (!scheduledAt) {
      return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const id = "post_" + Date.now().toString() + Math.random().toString(36).substring(2, 9);
    
    // We store mediaUrns as a JSON array string in Postgres to be safe, or as a proper array.
    // Since the schema defines it as TEXT[], we pass it as a literal array block if using raw pg,
    // but the easiest way to insert an array using pg is to pass the JS array to parameterized query.
    await pool.query(
      `INSERT INTO "Post" ("id", "userId", "content", "mediaUrns", "status", "scheduledAt", "platform", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [id, session.user.id, content, mediaUrns || [], "PENDING", new Date(scheduledAt), platform || "linkedin"]
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Failed to schedule post:", error);
    return NextResponse.json({ error: error.message || "Failed to schedule post" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const { rows } = await pool.query(
      `SELECT * FROM "Post" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [session.user.id]
    );

    return NextResponse.json({ posts: rows });
  } catch (error: any) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch posts" }, { status: 500 });
  }
}
