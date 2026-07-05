"use client";

import { useState, use, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import {
  ArrowLeft,
  Users,
  Mail,
  MessageSquare,
  Clock,
  Play,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Edit2,
  Check,
  X,
  Phone,
  Bot,
  Sliders,
  Award,
  BookOpen,
  GitBranch,
  Calendar,
  AlertCircle
} from "lucide-react";
import { DialerModal } from "@/components/common/dialer-modal";

type TabId = "overview" | "steps" | "leads" | "emails" | "analytics";

export default function SequenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sequenceId } = use(params);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  
  // Edit state for steps
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editingStepForm, setEditingStepForm] = useState<any>({
    type: "email_auto",
    delayDays: 0,
    subject: "",
    body: "",
    instructions: ""
  });

  // Call Dialer integration states
  const [dialerLead, setDialerLead] = useState<any | null>(null);

  // Fetch sequence detail
  const { data: sequence, isLoading, refetch } = useQuery<any>({
    queryKey: ["sequence-detail", sequenceId],
    queryFn: async () => {
      const res = await fetch(`/api/sequences/${sequenceId}`);
      if (!res.ok) throw new Error("Failed to fetch sequence details");
      return res.json();
    }
  });

  // Steps query
  const { data: steps = [], refetch: refetchSteps } = useQuery<any[]>({
    queryKey: ["sequence-steps", sequenceId],
    queryFn: async () => {
      const res = await fetch(`/api/sequences?sessionId=${sequenceId}`);
      if (!res.ok) throw new Error("Failed to fetch steps");
      return res.json();
    }
  });

  // Lead states query
  const { data: leadStates = [] } = useQuery<any[]>({
    queryKey: ["sequence-lead-states", sequenceId],
    queryFn: async () => {
      const res = await fetch(`/api/sequences?sessionId=${sequenceId}&action=states`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Save steps mutation
  const saveStepsMutation = useMutation({
    mutationFn: async (updatedSteps: any[]) => {
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_steps",
          sessionId: sequenceId,
          steps: updatedSteps
        })
      });
      if (!res.ok) throw new Error("Failed to save steps");
      return res.json();
    },
    onSuccess: () => {
      refetchSteps();
      setEditingStepIndex(null);
      alert("Sequence steps updated successfully!");
    }
  });

  // Process / Run sequence mutation
  const processSequenceMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process",
          sessionId: sequenceId
        })
      });
      if (!res.ok) throw new Error("Execution failed");
      return res.json();
    },
    onSuccess: (data) => {
      refetch();
      refetchSteps();
      queryClient.invalidateQueries({ queryKey: ["sequence-lead-states", sequenceId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      
      alert(
        `Sequence execution run completed successfully!\n` +
        `- Emails Drafted: ${data.emailsDrafted}\n` +
        `- Manual Tasks Queued: ${data.tasksCreated}\n` +
        `- Enrolled Leads Finished: ${data.completedLeads}`
      );
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-24 bg-surface-tertiary rounded" />
        <div className="h-10 w-64 bg-surface-tertiary rounded mt-2" />
        <div className="h-4 w-96 bg-surface-tertiary rounded mt-2" />
        <div className="h-[350px] bg-surface rounded-xl border border-border" />
      </div>
    );
  }

  if (!sequence) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Sequence Campaign not found</p>
        <Link href="/sequences" className="text-sm text-accent-500 hover:underline mt-2 inline-block">
          Back to Sequences
        </Link>
      </div>
    );
  }

  // Visual layout handlers
  const handleAddStep = () => {
    const newStep = {
      type: "email_auto",
      delayDays: 1,
      subject: "New Step Subject",
      body: "Hi {{contactName}},\n\nType body content here...",
      instructions: ""
    };
    const updated = [...steps, newStep];
    saveStepsMutation.mutate(updated);
  };

  const handleRemoveStep = (index: number) => {
    if (!confirm("Are you sure you want to delete this sequence step?")) return;
    const updated = steps.filter((_, idx) => idx !== index);
    saveStepsMutation.mutate(updated);
  };

  const handleEditClick = (index: number, stepObj: any) => {
    setEditingStepIndex(index);
    setEditingStepForm({
      type: stepObj.type,
      delayDays: stepObj.delayDays,
      subject: stepObj.subject || "",
      body: stepObj.body || "",
      instructions: stepObj.instructions || ""
    });
  };

  const handleSaveStepClick = (index: number) => {
    const updated = [...steps];
    updated[index] = {
      ...updated[index],
      type: editingStepForm.type,
      delayDays: parseInt(editingStepForm.delayDays, 10) || 0,
      subject: editingStepForm.subject,
      body: editingStepForm.body,
      instructions: editingStepForm.instructions
    };
    saveStepsMutation.mutate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/sequences"
        className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent-500 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Sequences
      </Link>

      {/* Header and top metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-text-primary">{sequence.name}</h1>
            <StatusBadge status={sequence.status} />
          </div>
          <p className="text-xs text-text-secondary mt-1">{sequence.description || "No description provided."}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation run trigger */}
          <button
            onClick={() => processSequenceMutation.mutate()}
            disabled={processSequenceMutation.isPending || steps.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-neutral-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {processSequenceMutation.isPending ? "Executing..." : "Process Active Steps"}
          </button>
        </div>
      </div>

      {/* Campaign navigation tabs */}
      <div className="flex items-center gap-1 border-b border-border bg-surface p-1 rounded-xl shadow-sm h-11 shrink-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
            activeTab === "overview" ? "bg-accent-500 text-white shadow-sm" : "text-text-secondary hover:bg-surface-secondary"
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("steps")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
            activeTab === "steps" ? "bg-accent-500 text-white shadow-sm" : "text-text-secondary hover:bg-surface-secondary"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          Sequence Steps ({steps.length})
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
            activeTab === "leads" ? "bg-accent-500 text-white shadow-sm" : "text-text-secondary hover:bg-surface-secondary"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          Enrolled Leads ({sequence.leads?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("emails")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
            activeTab === "emails" ? "bg-accent-500 text-white shadow-sm" : "text-text-secondary hover:bg-surface-secondary"
          )}
        >
          <Mail className="w-3.5 h-3.5" />
          Outreach Logs
        </button>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden p-5">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border p-4 bg-surface-secondary/40 rounded-xl">
                <div className="text-[10px] text-text-tertiary uppercase font-bold">Total Enrolled Leads</div>
                <div className="text-xl font-bold text-text-primary mt-1">{sequence.leads?.length || 0} contacts</div>
              </div>
              <div className="border border-border p-4 bg-surface-secondary/40 rounded-xl">
                <div className="text-[10px] text-text-tertiary uppercase font-bold">Auto Emails Sent</div>
                <div className="text-xl font-bold text-text-primary mt-1">{sequence.emailsSent || 0} drafts</div>
              </div>
              <div className="border border-border p-4 bg-surface-secondary/40 rounded-xl">
                <div className="text-[10px] text-text-tertiary uppercase font-bold">Outbound Channel</div>
                <div className="text-xl font-bold text-accent-500 mt-1 uppercase text-xs">{sequence.outboundChannel} Outreach</div>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Campaign Target Query</h3>
              <p className="text-xs bg-surface-secondary border border-border p-3 rounded-lg text-text-secondary italic">
                "{sequence.searchQuery}"
              </p>
            </div>
            
            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">How to process leads in sequence</h3>
              <ol className="list-decimal pl-4 text-xs text-text-secondary space-y-1.5">
                <li>Go to the <strong>Search & Prospect</strong> page and check B2B contacts.</li>
                <li>Click <strong>Add to Sequence</strong> and choose this sequence: <strong>{sequence.name}</strong>.</li>
                <li>Go to <strong>Sequence Steps</strong> tab to review email follow-up templates or connect notes.</li>
                <li>Click <strong>Process Active Steps</strong> at the top to auto-draft emails and queue tasks for calling or LinkedIn requests.</li>
                <li>Browse pending tasks in the <strong>Tasks</strong> cockpit page to execute calls or connects.</li>
              </ol>
            </div>
          </div>
        )}

        {/* STEPS TAB (Visual Sequence Timeline Builder) */}
        {activeTab === "steps" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Outreach Step Timeline</h3>
              <button
                onClick={handleAddStep}
                className="flex items-center gap-1 px-3 py-1 bg-accent-500/10 text-accent-500 hover:bg-accent-500 hover:text-white border border-accent-500/10 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Outreach Step
              </button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-tertiary">No outreach steps added yet. Click Add Outreach Step to design your timeline.</div>
            ) : (
              <div className="relative border-l border-border pl-6 ml-4 space-y-6 py-2">
                {steps.map((stepObj, index) => {
                  const isEditing = editingStepIndex === index;
                  
                  return (
                    <div key={stepObj.id || index} className="relative space-y-2 group">
                      {/* Bullet step point */}
                      <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border border-border bg-surface text-accent-500 font-bold flex items-center justify-center text-xs shadow-sm">
                        {index + 1}
                      </span>

                      {/* Header block */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary capitalize">
                            {stepObj.type.replace("_", " ")} Step
                          </span>
                          <span className="text-[10px] text-text-tertiary bg-surface-secondary border border-border px-2 py-0.5 rounded-full font-bold">
                            Delay: {stepObj.delayDays} {stepObj.delayDays === 1 ? "day" : "days"}
                          </span>
                        </div>
                        {!isEditing && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditClick(index, stepObj)}
                              className="p-1 text-text-tertiary hover:text-accent-500 hover:bg-surface-secondary rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveStep(index)}
                              className="p-1 text-text-tertiary hover:text-danger-600 hover:bg-surface-secondary rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Editor / Value card */}
                      {isEditing ? (
                        <div className="border border-accent-500/30 rounded-xl p-4 bg-surface-secondary/20 space-y-3 text-xs">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-text-secondary">Action Type</label>
                              <select
                                value={editingStepForm.type}
                                onChange={(e) => setEditingStepForm(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full bg-surface px-3 py-1.5 border border-border rounded-lg"
                              >
                                <option value="email_auto">Automatic Email</option>
                                <option value="email_manual">Manual Email</option>
                                <option value="linkedin_connect">LinkedIn Connect</option>
                                <option value="call">Phone Call</option>
                                <option value="task">General Task</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-text-secondary">Delay (days after previous step)</label>
                              <input
                                type="number"
                                value={editingStepForm.delayDays}
                                onChange={(e) => setEditingStepForm(prev => ({ ...prev, delayDays: e.target.value }))}
                                className="w-full bg-surface px-3 py-1.5 border border-border rounded-lg"
                              />
                            </div>
                          </div>

                          {(editingStepForm.type === "email_auto" || editingStepForm.type === "email_manual") ? (
                            <>
                              <div className="space-y-1">
                                <label className="font-bold text-text-secondary">Subject Template</label>
                                <input
                                  type="text"
                                  placeholder="Use {{companyName}}, {{contactName}}, {{location}} variables"
                                  value={editingStepForm.subject}
                                  onChange={(e) => setEditingStepForm(prev => ({ ...prev, subject: e.target.value }))}
                                  className="w-full bg-surface px-3 py-1.5 border border-border rounded-lg"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-text-secondary">Email Body Template</label>
                                <textarea
                                  placeholder="Write follow-up email..."
                                  value={editingStepForm.body}
                                  onChange={(e) => setEditingStepForm(prev => ({ ...prev, body: e.target.value }))}
                                  className="w-full bg-surface px-3 py-2 border border-border rounded-lg h-32 resize-none"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="space-y-1">
                              <label className="font-bold text-text-secondary">Action Instructions</label>
                              <textarea
                                placeholder="Describe details for the outreach agent..."
                                value={editingStepForm.instructions}
                                onChange={(e) => setEditingStepForm(prev => ({ ...prev, instructions: e.target.value }))}
                                className="w-full bg-surface px-3 py-2 border border-border rounded-lg h-20 resize-none"
                              />
                            </div>
                          )}

                          <div className="flex justify-end gap-1.5 border-t border-border pt-2">
                            <button
                              onClick={() => setEditingStepIndex(null)}
                              className="px-3 py-1.5 border border-border hover:bg-surface text-text-secondary font-semibold rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveStepClick(index)}
                              className="px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg"
                            >
                              Save Step
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-border/80 rounded-xl p-3 bg-surface shadow-sm text-xs space-y-2">
                          {(stepObj.type === "email_auto" || stepObj.type === "email_manual") ? (
                            <div className="space-y-1.5">
                              <div className="font-semibold text-text-primary truncate">Subject: {stepObj.subject || "Not Template Set"}</div>
                              <p className="text-text-secondary line-clamp-3 bg-surface-secondary/40 border border-border/40 p-2.5 rounded-lg font-mono text-[10px] whitespace-pre-line">
                                {stepObj.body}
                              </p>
                            </div>
                          ) : (
                            <p className="text-text-secondary bg-surface-secondary/40 border border-border/40 p-2.5 rounded-lg italic">
                              Instructions: {stepObj.instructions || "Call lead and check email response."}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">Enrolled target contacts</h3>
            {sequence.leads?.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-tertiary">No leads enrolled. Search and prospect contacts to enroll them in sequence.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-tertiary font-semibold bg-surface-secondary/30">
                      <th className="py-2 px-2">Contact Name</th>
                      <th className="py-2 px-2">Company</th>
                      <th className="py-2 px-2">Email</th>
                      <th className="py-2 px-2">Location</th>
                      <th className="py-2 px-2">Score</th>
                      <th className="py-2 px-2">Current Step Status</th>
                      <th className="py-2 px-2">Stage</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sequence.leads.map((lead: any) => {
                      const state = leadStates.find((st: any) => st.leadId === lead.id);
                      return (
                        <tr key={lead.id} className="border-b border-border/40 hover:bg-surface-secondary/30 transition-colors">
                          <td className="py-2.5 px-2">
                            <div className="font-semibold text-text-primary">{lead.contactName}</div>
                            <div className="text-[10px] text-text-secondary">{lead.contactTitle}</div>
                          </td>
                          <td className="py-2.5 px-2 font-medium text-text-primary">{lead.companyName}</td>
                          <td className="py-2.5 px-2 text-text-secondary">{lead.contactEmail || "Not Found"}</td>
                          <td className="py-2.5 px-2 text-text-secondary">{lead.location}</td>
                          <td className="py-2.5 px-2 font-bold text-accent-500">{lead.qualificationScore || 0}%</td>
                          <td className="py-2.5 px-2 font-semibold">
                            {state ? (
                              <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border border-border font-bold uppercase",
                                state.status === "active" ? "bg-accent-500/10 text-accent-500" :
                                state.status === "completed" ? "bg-success-500/10 text-success-600" : "bg-neutral-500/10 text-neutral-500"
                              )}>
                                Step {state.currentStepNumber}: {state.status}
                              </span>
                            ) : (
                              <span className="text-[10px] text-text-tertiary">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <StatusBadge status={lead.pipelineStage} />
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              {lead.contactEmail && (
                                <button
                                  onClick={() => setDialerLead(lead)}
                                  className="p-1 text-text-tertiary hover:text-accent-500 rounded bg-surface-secondary hover:bg-surface-tertiary transition-colors"
                                  title="Dial Call"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* OUTREACH LOGS TAB */}
        {activeTab === "emails" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">Email Logs & Notes</h3>
            {sequence.leads?.every((l: any) => !l.emails || l.emails.length === 0) ? (
              <div className="text-center py-12 text-xs text-text-tertiary">No emails drafted yet. Add leads to sequence and click Process Active Steps.</div>
            ) : (
              <div className="space-y-3">
                {sequence.leads.flatMap((l: any) => l.emails.map((email: any) => ({ ...email, lead: l }))).map((email: any) => (
                  <div key={email.id} className="border border-border p-4 bg-surface rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-text-primary">{email.lead.contactName}</span>
                        <span className="text-text-tertiary"> ({email.lead.companyName})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-secondary px-2 py-0.5 bg-surface-secondary border border-border rounded font-semibold uppercase">{email.emailType}</span>
                        <StatusBadge status={email.status} />
                      </div>
                    </div>
                    <div className="text-xs border-t border-border/40 pt-2 text-text-primary font-semibold">Subject: {email.subject}</div>
                    <div className="text-[11px] text-text-secondary bg-surface-secondary/40 border border-border/40 p-2.5 rounded-lg whitespace-pre-line font-mono leading-relaxed">{email.body}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">Campaign analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="border border-border p-4 bg-surface rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-text-secondary uppercase">Email Open vs Reply Ratio</h4>
                <div className="h-48 flex items-end justify-center gap-8 pt-6 border-b border-border pb-2">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 bg-accent-500 rounded-t-lg transition-all" style={{ height: "70%" }}></div>
                    <span className="text-[10px] font-semibold text-text-secondary">Opened (70%)</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 bg-success-500 rounded-t-lg transition-all" style={{ height: "24%" }}></div>
                    <span className="text-[10px] font-semibold text-text-secondary">Replied (24%)</span>
                  </div>
                </div>
              </div>

              <div className="border border-border p-4 bg-surface rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-text-secondary uppercase">Lead qualification levels</h4>
                <div className="h-48 flex items-end justify-center gap-6 pt-6 border-b border-border pb-2">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 bg-neutral-300 rounded-t-lg" style={{ height: "100%" }}></div>
                    <span className="text-[9px] font-semibold text-text-secondary">Total</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 bg-accent-400 rounded-t-lg" style={{ height: "65%" }}></div>
                    <span className="text-[9px] font-semibold text-text-secondary">Qualified</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 bg-success-500 rounded-t-lg" style={{ height: "30%" }}></div>
                    <span className="text-[9px] font-semibold text-text-secondary">Emailed</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 bg-orange-500 rounded-t-lg" style={{ height: "10%" }}></div>
                    <span className="text-[9px] font-semibold text-text-secondary">Interested</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CALL DIALER POPUP MODAL */}
      {dialerLead && (
        <DialerModal
          lead={dialerLead}
          onClose={() => setDialerLead(null)}
          onSuccess={() => {
            setDialerLead(null);
            refetch();
            queryClient.invalidateQueries({ queryKey: ["sequence-lead-states", sequenceId] });
          }}
        />
      )}
    </div>
  );
}
