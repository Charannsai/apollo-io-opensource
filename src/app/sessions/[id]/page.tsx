"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import { useSession, useUpdateSession } from "@/hooks/use-sessions";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Mail,
  MessageSquare,
  Clock,
  Edit3,
  Check,
  X,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

type TabId = "overview" | "leads" | "emails" | "analytics";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, isLoading } = useSession(id);
  const updateSession = useUpdateSession();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "leads", label: "Leads", icon: Users },
    { id: "emails", label: "Emails", icon: Mail },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-24 bg-surface-tertiary rounded mb-6" />
        <div className="h-8 w-64 bg-surface-tertiary rounded mb-2" />
        <div className="h-4 w-96 bg-surface-tertiary rounded mb-8" />
        <div className="h-[400px] bg-surface-tertiary rounded-xl" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Session not found</p>
        <Link href="/sessions" className="text-sm text-accent-500 hover:underline mt-2 inline-block">
          Back to sessions
        </Link>
      </div>
    );
  }

  const handleSaveName = () => {
    if (editName.trim() && editName !== session.name) {
      updateSession.mutate({ id: session.id, name: editName.trim() });
    }
    setIsEditingName(false);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
      {/* Back Link */}
      <motion.div variants={fadeUp}>
        <Link
          href="/sessions"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sessions
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp}>
        <PageHeader
          title=""
          action={
            <StatusBadge status={session.status} />
          }
        />
        <div className="flex items-center gap-2 -mt-6 mb-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") setIsEditingName(false);
                }}
                className={cn(
                  "text-2xl font-semibold tracking-tight px-2 py-0.5 rounded-lg border",
                  "bg-surface border-accent-500 text-text-primary",
                  "focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                )}
                autoFocus
              />
              <button onClick={handleSaveName} className="p-1 rounded hover:bg-success-50 text-success-500">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditingName(false)} className="p-1 rounded hover:bg-surface-hover text-text-tertiary">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                {session.name}
              </h1>
              <button
                onClick={() => {
                  setEditName(session.name);
                  setIsEditingName(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface-hover text-text-tertiary transition-opacity"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-text-secondary mb-6">{session.searchQuery}</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3 mb-6">
        <div className="px-4 py-3 rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="text-xs text-text-secondary">Leads</span>
          </div>
          <p className="text-lg font-semibold text-text-primary">{session.leads?.length || 0}</p>
        </div>
        <div className="px-4 py-3 rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-1.5 mb-1">
            <Mail className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="text-xs text-text-secondary">Emails Sent</span>
          </div>
          <p className="text-lg font-semibold text-text-primary">{session.emailsSent}</p>
        </div>
        <div className="px-4 py-3 rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="text-xs text-text-secondary">Replies</span>
          </div>
          <p className="text-lg font-semibold text-text-primary">{session.repliesCount}</p>
        </div>
        <div className="px-4 py-3 rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="text-xs text-text-secondary">Created</span>
          </div>
          <p className="text-sm font-medium text-text-primary">
            {new Date(session.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all duration-150",
                activeTab === tab.id
                  ? "border-accent-500 text-accent-500"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={fadeUp}>
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-surface">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Search Query</h3>
              <p className="text-sm text-text-secondary">{session.searchQuery}</p>
            </div>
            {session.description && (
              <div className="p-4 rounded-xl border border-border bg-surface">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Description</h3>
                <p className="text-sm text-text-secondary">{session.description}</p>
              </div>
            )}
            {session.template && (
              <div className="p-4 rounded-xl border border-border bg-surface">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Template</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-text-secondary">{session.template.name}</p>
                  <StatusBadge status={session.template.category} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "leads" && (
          <div>
            {session.leads && session.leads.length > 0 ? (
              <div className="space-y-1">
                {session.leads.map((lead: { id: string; companyName: string; contactName: string | null; contactEmail: string | null; contactTitle: string | null; pipelineStage: string }) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-surface-hover transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{lead.companyName}</p>
                      <p className="text-xs text-text-secondary">
                        {lead.contactName || "—"} · {lead.contactEmail || "—"}
                      </p>
                      {lead.contactTitle && (
                        <p className="text-xs text-text-tertiary">{lead.contactTitle}</p>
                      )}
                    </div>
                    <StatusBadge status={lead.pipelineStage} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-secondary text-sm">
                No leads discovered yet. Start a search to find leads.
              </div>
            )}
          </div>
        )}

        {activeTab === "emails" && (
          <div className="text-center py-12 text-text-secondary text-sm">
            Email generation will be available in Phase 3.
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="text-center py-12 text-text-secondary text-sm">
            Session analytics will be available in Phase 4.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
