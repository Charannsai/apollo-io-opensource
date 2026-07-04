"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/common/status-badge";
import Link from "next/link";
import {
  Layers,
  Mail,
  MessageSquare,
  Users,
  ArrowRight,
  Search,
  Clock,
  Zap,
  TrendingUp,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/common/skeletons";

interface DashboardData {
  stats: {
    totalSessions: number;
    activeSessions: number;
    totalLeads: number;
    totalEmailsSent: number;
    totalReplies: number;
    replyRate: string;
    pendingReviewCount: number;
  };
  recentSessions: Array<{
    id: string;
    name: string;
    searchQuery: string;
    status: string;
    updatedAt: string;
    _count: { leads: number };
  }>;
  recentReplies: Array<{
    id: string;
    subject: string | null;
    body: string;
    fromName: string | null;
    fromEmail: string;
    classification: string | null;
    receivedAt: string;
    lead: {
      companyName: string;
      contactName: string | null;
      contactEmail: string | null;
    };
  }>;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = data?.stats;
  const recentSessions = data?.recentSessions || [];
  const recentReplies = data?.recentReplies || [];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      {/* Greeting */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Here&apos;s your outreach overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          icon={Users}
          label="Total Leads"
          value={stats?.totalLeads || 0}
        />
        <StatCard
          icon={Mail}
          label="Emails Sent"
          value={stats?.totalEmailsSent || 0}
        />
        <StatCard
          icon={MessageSquare}
          label="Replies"
          value={stats?.totalReplies || 0}
        />
        <StatCard
          icon={TrendingUp}
          label="Reply Rate"
          value={`${stats?.replyRate || 0}%`}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <Link
          href="/search"
          className={cn(
            "group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150",
            "border-border bg-surface hover:bg-surface-hover hover:border-accent-500/30"
          )}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-500/10 text-accent-500 group-hover:bg-accent-500/20 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">New Search</p>
            <p className="text-xs text-text-tertiary">Discover new leads</p>
          </div>
        </Link>

        <Link
          href="/sessions"
          className={cn(
            "group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150",
            "border-border bg-surface hover:bg-surface-hover hover:border-accent-500/30"
          )}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-500/10 text-accent-500 group-hover:bg-accent-500/20 transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">Sessions</p>
            <p className="text-xs text-text-tertiary">
              {stats?.activeSessions || 0} active
            </p>
          </div>
        </Link>

        {(stats?.pendingReviewCount || 0) > 0 ? (
          <Link
            href="/sessions"
            className={cn(
              "group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150",
              "border-warning-500/30 bg-warning-50/50 hover:bg-warning-50 dark:bg-warning-500/5 dark:hover:bg-warning-500/10"
            )}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-warning-500/10 text-warning-500">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Review Queue
              </p>
              <p className="text-xs text-warning-600 dark:text-warning-500">
                {stats?.pendingReviewCount} emails pending
              </p>
            </div>
          </Link>
        ) : (
          <Link
            href="/inbox"
            className={cn(
              "group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150",
              "border-border bg-surface hover:bg-surface-hover hover:border-accent-500/30"
            )}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-500/10 text-accent-500 group-hover:bg-accent-500/20 transition-colors">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Inbox</p>
              <p className="text-xs text-text-tertiary">Check replies</p>
            </div>
          </Link>
        )}
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Recent Sessions
            </h2>
            <Link
              href="/sessions"
              className="text-xs text-text-tertiary hover:text-accent-500 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl">
              <Zap className="w-8 h-8 text-text-tertiary mb-3" />
              <p className="text-sm text-text-secondary mb-1">
                No sessions yet
              </p>
              <p className="text-xs text-text-tertiary">
                Start a search to create your first session
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                    "hover:bg-surface-hover group"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent-500 transition-colors">
                      {session.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-tertiary">
                        {session._count.leads} leads
                      </span>
                      <span className="text-text-tertiary">·</span>
                      <span className="text-xs text-text-tertiary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(session.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={session.status} />
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Replies */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Recent Replies
            </h2>
            <Link
              href="/inbox"
              className="text-xs text-text-tertiary hover:text-accent-500 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentReplies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl">
              <MessageSquare className="w-8 h-8 text-text-tertiary mb-3" />
              <p className="text-sm text-text-secondary mb-1">
                No replies yet
              </p>
              <p className="text-xs text-text-tertiary">
                Replies will appear here once you send emails
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentReplies.map((reply) => (
                <div
                  key={reply.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-all duration-150"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-tertiary shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-text-secondary">
                      {(
                        reply.fromName || reply.fromEmail
                      )[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {reply.fromName || reply.fromEmail}
                      </p>
                      {reply.classification && (
                        <StatusBadge status={reply.classification} />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {reply.lead.companyName}
                    </p>
                    <p className="text-xs text-text-tertiary line-clamp-1 mt-0.5">
                      {reply.body.slice(0, 100)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="px-4 py-3.5 rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-text-tertiary" />
        <span className="text-xs text-text-secondary font-medium">{label}</span>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Title block */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border border-border bg-surface rounded-xl space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 border border-border bg-surface rounded-xl space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        ))}
      </div>

      {/* Table Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="p-5 border border-border bg-surface rounded-xl space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border/40">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Replies */}
        <div className="p-5 border border-border bg-surface rounded-xl space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-2 border-b border-border/40 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
