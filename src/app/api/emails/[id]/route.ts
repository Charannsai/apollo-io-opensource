import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const email = await prisma.leadEmail.update({
      where: { id },
      data: body
    });

    // Sync pipeline stage of the lead if email status is changed
    if (body.status === "approved") {
      const emailWithLead = await prisma.leadEmail.findUnique({
        where: { id },
        select: { leadId: true }
      });
      if (emailWithLead) {
        await prisma.lead.update({
          where: { id: emailWithLead.leadId },
          data: { pipelineStage: "approved" }
        });
      }
    }

    return NextResponse.json(email);
  } catch (error) {
    console.error("Email PATCH error:", error);
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 });
  }
}
