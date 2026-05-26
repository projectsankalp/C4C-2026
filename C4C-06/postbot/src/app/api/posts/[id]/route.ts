import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Pool } from "pg";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paramsData = await params;
    const { id } = paramsData;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Only allow deleting the user's own post
    const result = await pool.query(
      `DELETE FROM "Post" WHERE "id" = $1 AND "userId" = $2 RETURNING "id"`,
      [id, session.user.id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Post not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete post:", error);
    return NextResponse.json({ error: error.message || "Failed to delete post" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paramsData = await params;
    const { id } = paramsData;
    const body = await req.json();

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    let query = `UPDATE "Post" SET "updatedAt" = NOW()`;
    const values: any[] = [];
    let paramIndex = 1;

    if (body.content !== undefined) {
      query += `, content = $${paramIndex}`;
      values.push(body.content);
      paramIndex++;
    }

    if (body.scheduledAt !== undefined) {
      query += `, "scheduledAt" = $${paramIndex}`;
      values.push(new Date(body.scheduledAt));
      paramIndex++;
    }

    query += ` WHERE "id" = $${paramIndex} AND "userId" = $${paramIndex + 1} RETURNING *`;
    values.push(id, session.user.id);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Post not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post: result.rows[0] });
  } catch (error: any) {
    console.error("Failed to update post:", error);
    return NextResponse.json({ error: error.message || "Failed to update post" }, { status: 500 });
  }
}
