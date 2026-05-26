import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Create Post table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Post" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "mediaUrns" TEXT[],
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "scheduledAt" TIMESTAMP(3),
          "publishedAt" TIMESTAMP(3),
          "platform" TEXT NOT NULL DEFAULT 'linkedin',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
      );
    `);

    // Add foreign key constraint if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE "Post" 
        ADD CONSTRAINT "Post_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e: any) {
      // Constraint likely already exists, ignore
      console.log("Constraint might already exist:", e.message);
    }

    return NextResponse.json({ success: true, message: "Database migrated successfully." });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
