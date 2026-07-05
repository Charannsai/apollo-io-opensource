"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GitBranch,
  Plus,
  Trash2,
  CheckCircle,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const triggerOptions = [
  { id: "lead_replied", label: "When Lead Replies to email" },
  { id: "deal_created", label: "When Opportunity Deal is created" },
  { id: "call_logged", label: "When Phone Call outcome is logged" },
  { id: "email_opened", label: "When Email template is opened" }
];

const actionOptions = [
  { id: "move_deal", label: "Auto-move Deal to 'Proposal Sent'" },
  { id: "create_task", label: "Queue manual Call follow-up Task" },
  { id: "send_slack", label: "Send notification to team Slack" },
  { id: "update_lead", label: "Mark Lead Stage as 'Qualified'" }
];

export default function WorkflowsPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  // New Workflow Form State
  const [form, setForm] = useState({
    name: "",
    trigger: "lead_replied",
    action: "create_task"
  });

  // Fetch Workflows
  const { data: workflows = [], isLoading } = useQuery<any[]>({
    queryKey: ["workflows"],
    queryFn: async () => {
      const res = await fetch("/api/workflows");
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return res.json();
    }
  });

  // Create Workflow Mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create workflow");
      return res.json();
    },
    onSuccess: () => {
      setShowAddModal(false);
      setForm({ name: "", trigger: "lead_replied", action: "create_task" });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      alert("Workflow automation rule active!");
    }
  });

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch("/api/workflows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId: id, isActive })
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    }
  });

  // Delete Workflow Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workflows?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete workflow");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.trigger || !form.action) return;
    createMutation.mutate(form);
  };

  const getTriggerLabel = (id: string) => {
    return triggerOptions.find(t => t.id === id)?.label || id;
  };

  const getActionLabel = (id: string) => {
    return actionOptions.find(a => a.id === id)?.label || id;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Workflow Automation</h1>
          <p className="text-xs text-text-secondary">Define trigger-action rules to automate outreach progression, lead status updates, and notifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Workflow
          </button>
        </div>
      </div>

      {/* Rules list grid */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-surface-tertiary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-xl">
            <GitBranch className="w-12 h-12 text-text-tertiary/20 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-text-primary">No workflows active</h3>
            <p className="text-xs text-text-tertiary max-w-sm mx-auto mt-1.5">Workflows trigger auto-actions when status changes occur. Create a workflow rule to get started.</p>
          </div>
        ) : (
          workflows.map((wf) => (
            <div
              key={wf.id}
              className="flex items-center justify-between gap-4 p-4 bg-surface border border-border rounded-xl shadow-sm hover:border-border transition-all"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className={cn("w-4 h-4", wf.isActive ? "text-yellow-500 animate-bounce" : "text-text-tertiary")} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-text-primary block">{wf.name}</span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] text-text-secondary">
                    <span className="px-2 py-0.5 bg-surface-secondary border border-border rounded font-bold uppercase text-[8px]">Trigger</span>
                    <span className="font-medium">{getTriggerLabel(wf.trigger)}</span>
                    <span className="text-text-tertiary font-bold">➔</span>
                    <span className="px-2 py-0.5 bg-accent-500/10 text-accent-500 rounded font-bold uppercase text-[8px]">Action</span>
                    <span className="font-semibold text-text-primary">{getActionLabel(wf.action)}</span>
                  </div>
                </div>
              </div>

              {/* Status toggles */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => toggleActiveMutation.mutate({ id: wf.id, isActive: !wf.isActive })}
                  className="p-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  {wf.isActive ? (
                    <ToggleRight className="w-8 h-8 text-success-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-text-tertiary" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this workflow automation rule?")) {
                      deleteMutation.mutate(wf.id);
                    }
                  }}
                  className="p-1.5 hover:bg-danger-500/10 text-text-tertiary hover:text-danger-600 border border-border hover:border-danger-500/20 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-surface border border-border p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="text-sm font-bold text-text-primary">Create Workflow Automation</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-text-tertiary hover:text-text-primary rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-text-secondary">Workflow Name*</label>
                <input
                  type="text"
                  placeholder="e.g. Move Replied Leads to Proposals"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-surface-secondary px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-secondary">Trigger Condition*</label>
                <select
                  value={form.trigger}
                  onChange={(e) => setForm(prev => ({ ...prev, trigger: e.target.value }))}
                  className="w-full bg-surface-secondary px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none"
                  required
                >
                  {triggerOptions.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-secondary">Automated Action*</label>
                <select
                  value={form.action}
                  onChange={(e) => setForm(prev => ({ ...prev, action: e.target.value }))}
                  className="w-full bg-surface-secondary px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none"
                  required
                >
                  {actionOptions.map(a => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border hover:bg-surface-secondary text-text-secondary font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.name || !form.trigger || !form.action || createMutation.isPending}
                  className="px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                >
                  {createMutation.isPending ? "Activating..." : "Confirm Rules"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
