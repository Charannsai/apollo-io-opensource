import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [
      totalSessions,
      activeSessions,
      totalLeads,
      totalEmailsSent,
      totalReplies,
      recentSessions,
      recentReplies,
      pendingReviewCount,
    ] = await Promise.all([
      prisma.session.count(),
      prisma.session.count({
        where: { status: { notIn: ["completed", "draft"] } },
      }),
      prisma.lead.count(),
      prisma.leadEmail.count({ where: { status: "sent" } }),
      prisma.reply.count(),
      prisma.session.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { _count: { select: { leads: true } } },
      }),
      prisma.reply.findMany({
        orderBy: { receivedAt: "desc" },
        take: 5,
        include: {
          lead: {
            select: { companyName: true, contactName: true, contactEmail: true },
          },
        },
      }),
      prisma.leadEmail.count({ where: { status: "draft" } }),
    ]);

    const replyRate =
      totalEmailsSent > 0
        ? ((totalReplies / totalEmailsSent) * 100).toFixed(1)
        : "0";

    return NextResponse.json({
      stats: {
        totalSessions,
        activeSessions,
        totalLeads,
        totalEmailsSent,
        totalReplies,
        replyRate,
        pendingReviewCount,
      },
      recentSessions,
      recentReplies,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
