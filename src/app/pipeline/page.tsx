"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/page-header";
import { GitBranch } from "lucide-react";

const stages = [
  { label: "Generated", count: 0, color: "bg-neutral-400" },
  { label: "Qualified", count: 0, color: "bg-accent-400" },
  { label: "Personalized", count: 0, color: "bg-accent-500" },
  { label: "Reviewed", count: 0, color: "bg-warning-500" },
  { label: "Sent", count: 0, color: "bg-success-500" },
  { label: "Replied", count: 0, color: "bg-accent-600" },
  { label: "Converted", count: 0, color: "bg-success-600" },
];

export default function PipelinePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Pipeline"
        description="Track leads through every stage of outreach"
      />

      {/* Pipeline Columns Preview */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.label}
            className="flex-1 min-w-[160px] p-4 rounded-xl border border-border bg-surface"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${stage.color}`} />
              <span className="text-xs font-semibold text-text-primary">
                {stage.label}
              </span>
              <span className="ml-auto text-xs text-text-tertiary">
                {stage.count}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg">
              <GitBranch className="w-5 h-5 text-text-tertiary mb-2" />
              <p className="text-xs text-text-tertiary">No leads</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-8 text-sm text-text-secondary">
        Pipeline view will be fully interactive in Phase 4.
      </div>
    </motion.div>
  );
}
