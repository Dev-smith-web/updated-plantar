import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plants } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const createdBy = searchParams.get("createdBy");

  let query = db.query.plants.findMany({
    with: { parts: true },
    ...(createdBy ? { where: eq(plants.createdBy, createdBy) } : {}),
  });

  const results = await query;
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const [plant] = await db
    .insert(plants)
    .values({
      ...body,
      createdBy: session.user.id,
    })
    .returning();

  return NextResponse.json(plant, { status: 201 });
}
