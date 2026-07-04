import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [entries, files] = await Promise.all([
      prisma.knowledgeEntry.findMany({
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      }),
      prisma.knowledgeFile.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ entries, files });
  } catch (error) {
    console.error("Knowledge GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge base" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, label, value, sortOrder } = body;

    if (!category || !label || !value) {
      return NextResponse.json(
        { error: "Category, label, and value are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.knowledgeEntry.create({
      data: { category, label, value, sortOrder: sortOrder || 0 },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Knowledge POST error:", error);
    return NextResponse.json(
      { error: "Failed to create knowledge entry" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries } = body;

    if (!Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Entries array is required" },
        { status: 400 }
      );
    }

    // Upsert all entries in a transaction
    await prisma.$transaction(
      entries.map(
        (entry: { id?: string; category: string; label: string; value: string; sortOrder?: number }) =>
          entry.id
            ? prisma.knowledgeEntry.update({
                where: { id: entry.id },
                data: {
                  category: entry.category,
                  label: entry.label,
                  value: entry.value,
                  sortOrder: entry.sortOrder || 0,
                },
              })
            : prisma.knowledgeEntry.create({
                data: {
                  category: entry.category,
                  label: entry.label,
                  value: entry.value,
                  sortOrder: entry.sortOrder || 0,
                },
              })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Knowledge PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update knowledge base" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    await prisma.knowledgeEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Knowledge DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete knowledge entry" },
      { status: 500 }
    );
  }
}
