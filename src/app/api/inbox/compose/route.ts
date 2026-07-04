import { NextRequest, NextResponse } from "next/server";
import { sendMimeEmail } from "@/lib/gmail";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const to = formData.get("to") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;
    const fromName = (formData.get("fromName") as string) || undefined;

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields (to, subject, body)" },
        { status: 400 }
      );
    }

    const attachments: Array<{ name: string; content: string; mimeType: string }> = [];
    const files = formData.getAll("files");

    for (const f of files) {
      if (f instanceof File) {
        const arrayBuf = await f.arrayBuffer();
        const base64 = Buffer.from(arrayBuf).toString("base64");
        attachments.push({
          name: f.name,
          content: base64,
          mimeType: f.type || "application/octet-stream"
        });
      }
    }

    const result = await sendMimeEmail({
      to,
      subject,
      body,
      attachments,
      fromName
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Compose mail failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compose email" },
      { status: 500 }
    );
  }
}
