import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        session: { select: { name: true } }
      }
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Pipeline GET error:", error);
    return NextResponse.json({ error: "Failed to fetch pipeline leads" }, { status: 500 });
  }
}
