import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizQuestions } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plantId = searchParams.get("plantId");
  const difficulty = searchParams.get("difficulty");

  let results;
  if (plantId) {
    results = await db.query.quizQuestions.findMany({
      where: eq(quizQuestions.plantId, plantId),
    });
  } else {
    results = await db.query.quizQuestions.findMany();
  }

  if (difficulty) {
    results = results.filter((q) => q.difficulty === difficulty);
  }

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["teacher", "admin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const [question] = await db
    .insert(quizQuestions)
    .values({ ...body, createdByTeacher: true })
    .returning();

  return NextResponse.json(question, { status: 201 });
}
