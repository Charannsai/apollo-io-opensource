import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const lead = await prisma.lead.update({
      where: { id },
      data: body,
      include: { emails: true }
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Lead PATCH error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
