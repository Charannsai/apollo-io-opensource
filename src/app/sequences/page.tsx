"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/page-header";
import { Modal } from "@/components/common/modal";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import Link from "next/link";
import {
  Plus,
  Search,
  Layers,
  Clock,
  Trash2,
  X,
  Users,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function SequencesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteSequenceId, setDeleteSequenceId] = useState<string | null>(null);

  // Fetch sequences from /api/sequences
  const { data: sequences = [], isLoading } = useQuery<any[]>({
    queryKey: ["sequences", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/sequences?${params}`);
      if (!res.ok) throw new Error("Failed to fetch sequences");
      return res.json();
    }
  });

  // Delete sequence mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sequences/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      setDeleteSequenceId(null);
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  // Create sequence mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; searchQuery: string; description: string; outboundChannel: string }) => {
      const res = await fetch("/api/sessions", { // sessions POST handler works perfectly for creating sessions/sequences
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create sequence");
      return res.json();
    },
    onSuccess: (data) => {
      // Auto-create Step 1 and Step 2 templates for sequence
      fetch(`/api/sequences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_steps",
          sessionId: data.id,
          steps: [
            { type: "email_auto", delayDays: 0, subject: `Outreach to {{companyName}}`, body: `Hi {{contactName}},\n\nI noticed you are based in {{location}} and scaling operations at {{companyName}}.\n\nWould love to discuss how our solutions fit your needs.\n\nBest,\nCharan` },
            { type: "linkedin_connect", delayDays: 2, instructions: `Send connection request to {{contactName}}` }
          ]
        })
      });

      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ["sequences"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const statuses = [
    "all",
    "draft",
    "searching",
    "qualifying",
    "personalizing",
    "reviewing",
    "sending",
    "completed",
    "paused",
  ];

  return (
    <div>
      <PageHeader
        title="Sequences & Campaigns"
        description="Design multi-step email & social outreach campaigns to automate your B2B sales pipeline"
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
              "bg-accent-500 text-white hover:bg-accent-600 shadow-sm"
            )}
          >
            <Plus className="w-4 h-4" />
            New Sequence
          </button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search sequences..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-9 pr-3 py-2 rounded-lg text-sm border transition-all duration-150",
              "bg-surface border-border text-text-primary placeholder:text-text-tertiary",
              "focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
            )}
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === "all" ? "" : s)}
              className={cn(
                "px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer",
                (s === "all" && !statusFilter) || statusFilter === s
                  ? "bg-accent-500/10 text-accent-500"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sequences List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[72px] bg-surface-tertiary rounded-xl animate-pulse border border-border"
            />
          ))}
        </div>
      ) : sequences && sequences.length > 0 ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          className="space-y-1"
        >
          {sequences.map((sequence) => (
            <motion.div key={sequence.id} variants={fadeUp}>
              <Link
                href={`/sequences/${sequence.id}`}
                className={cn(
                  "flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-transparent transition-all duration-150 bg-surface border-border/40 shadow-sm",
                  "hover:bg-surface-hover hover:border-border group"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-accent-500 transition-colors truncate">
                      {sequence.name}
                    </p>
                    <StatusBadge status={sequence.status} />
                  </div>
                  <p className="text-xs text-text-tertiary truncate mt-0.5">
                    {sequence.searchQuery}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1 text-xs text-text-secondary font-medium">
                    <Users className="w-3.5 h-3.5 text-text-tertiary" />
                    {sequence._count.leads} leads
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-secondary font-medium">
                    <Mail className="w-3.5 h-3.5 text-text-tertiary" />
                    {sequence.emailsSent} sent
                  </div>
                  <span className="text-xs text-text-tertiary flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(sequence.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteSequenceId(sequence.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No sequences found"
          description="Create your first campaign sequence to start bulk enrolling contacts and scheduling outreach steps."
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-accent-500 text-white hover:bg-accent-600 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Sequence
            </button>
          }
        />
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateSequenceModal
            onClose={() => setShowCreateModal(false)}
            onConfirm={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
          />
        )}
      </AnimatePresence>

      <Modal
        isOpen={deleteSequenceId !== null}
        onClose={() => setDeleteSequenceId(null)}
        onConfirm={() => {
          if (deleteSequenceId) {
            deleteMutation.mutate(deleteSequenceId);
          }
        }}
        title="Delete Sequence"
        description="Are you sure you want to delete this outreach sequence? This will remove all associated leads, sequence logs, and email history drafts."
        confirmText="Delete Sequence"
        isDanger={true}
      />
    </div>
  );
}

function CreateSequenceModal({
  onClose,
  onConfirm,
  isPending
}: {
  onClose: () => void;
  onConfirm: (data: { name: string; searchQuery: string; description: string; outboundChannel: string }) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [description, setDescription] = useState("");
  const [outboundChannel, setOutboundChannel] = useState("email");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm({ name, searchQuery: searchQuery || "Manual Selections", description, outboundChannel });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5 border-b border-border pb-2">
          <h2 className="text-sm font-bold text-text-primary">
            Create Campaign Sequence
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-secondary text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-text-secondary">Sequence Name*</label>
            <input
              type="text"
              placeholder="e.g. SaaS Founders Q3 Outreach"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-secondary px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-text-secondary">Description</label>
            <textarea
              placeholder="ICP description or campaign notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-secondary px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none h-16 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-text-secondary">Search Query / Tag Criteria</label>
            <input
              type="text"
              placeholder="e.g. Job Title: CEO, Size: 11-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-secondary px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-text-secondary">Primary Channel</label>
            <select
              value={outboundChannel}
              onChange={(e) => setOutboundChannel(e.target.value)}
              className="w-full bg-surface-secondary px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none"
            >
              <option value="email">Email Outreach</option>
              <option value="linkedin">LinkedIn Connections</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border hover:bg-surface-secondary text-text-secondary font-semibold rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
            >
              {isPending ? "Creating..." : "Create Sequence"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
