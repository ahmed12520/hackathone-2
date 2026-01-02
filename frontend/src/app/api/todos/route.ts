import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 1. GET: Saare tasks mangwana
export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const result = await pool.query(
            'SELECT * FROM todo WHERE "userId" = $1 ORDER BY "createdAt" DESC', 
            [session.user.id]
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

// 2. POST: Naya task add karna
export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { task } = await req.json();
        const result = await pool.query(
            'INSERT INTO todo (task, "userId", completed) VALUES ($1, $2, $3) RETURNING *',
            [task, session.user.id, false]
        );
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}

// 3. PATCH: Task ko complete/incomplete mark karna
export async function PATCH(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, completed } = await req.json();
        const result = await pool.query(
            'UPDATE todo SET completed = $1 WHERE id = $2 AND "userId" = $3 RETURNING *',
            [completed, id, session.user.id]
        );
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

// 4. DELETE: Task delete karna
export async function DELETE(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await req.json();
        await pool.query(
            'DELETE FROM todo WHERE id = $1 AND "userId" = $2',
            [id, session.user.id]
        );
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}