"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/page-header";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="AI Search"
        description="Discover leads with natural language queries"
      />

      <div className="max-w-2xl mx-auto mt-12">
        {/* Search Box */}
        <div className="relative mb-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Sparkles className="w-5 h-5 text-accent-500" />
          </div>
          <input
            type="text"
            placeholder="Find early-stage AI startups hiring full-stack engineers..."
            className={cn(
              "w-full pl-12 pr-4 py-4 rounded-2xl text-base border-2 transition-all duration-200",
              "bg-surface border-border text-text-primary placeholder:text-text-tertiary",
              "focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10",
              "shadow-sm"
            )}
            disabled
          />
        </div>

        {/* Coming Soon Notice */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-500/10 mb-4">
            <Search className="w-8 h-8 text-accent-500" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-2">
            AI Search Coming in Phase 2
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            This workspace will let you search for leads using natural language.
            The AI will understand your intent, ask follow-up questions, and
            discover leads through Apify integrations.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 max-w-sm mx-auto text-left">
            {[
              "Find early-stage AI startups hiring full-stack engineers",
              "Find agencies looking for React Native freelancers",
              "Find founders building healthcare SaaS in Europe",
            ].map((example, i) => (
              <div
                key={i}
                className="px-4 py-2.5 rounded-xl border border-border bg-surface-secondary text-xs text-text-secondary"
              >
                &quot;{example}&quot;
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
