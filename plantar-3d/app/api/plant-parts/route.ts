import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plantParts } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plantId = searchParams.get("plantId");

  if (plantId) {
    const results = await db.query.plantParts.findMany({
      where: eq(plantParts.plantId, plantId),
    });
    return NextResponse.json(results);
  }

  const results = await db.query.plantParts.findMany();
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["teacher", "admin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const [part] = await db.insert(plantParts).values(body).returning();

  return NextResponse.json(part, { status: 201 });
}
