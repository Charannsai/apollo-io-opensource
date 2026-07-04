import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      include: { _count: { select: { sessions: true } } },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Templates GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      description,
      subjectRules,
      bodyInstructions,
      tone,
      followUpEnabled,
      followUpCount,
      followUpDelayDays,
      followUpInstructions,
      attachResume,
      attachPortfolio,
      aiPromptOverride,
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        category,
        description,
        subjectRules,
        bodyInstructions,
        tone: tone || "professional",
        followUpEnabled: followUpEnabled ?? true,
        followUpCount: followUpCount ?? 2,
        followUpDelayDays: followUpDelayDays ?? 3,
        followUpInstructions,
        attachResume: attachResume ?? false,
        attachPortfolio: attachPortfolio ?? false,
        aiPromptOverride,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Templates POST error:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
