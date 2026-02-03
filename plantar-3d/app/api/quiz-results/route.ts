import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizResults } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const results = await db.query.quizResults.findMany({
      where: eq(quizResults.userId, userId),
    });
    return NextResponse.json(results);
  }

  // Teachers/admins can see all results
  const session = await auth();
  if (!session?.user || !["teacher", "admin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = await db.query.quizResults.findMany();
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const [result] = await db
    .insert(quizResults)
    .values({
      ...body,
      userId: session.user.id,
      studentName: body.studentName || session.user.name || "Student",
    })
    .returning();

  return NextResponse.json(result, { status: 201 });
}
