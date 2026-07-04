import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  // Session statuses
  draft: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  searching: "bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400",
  qualifying: "bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400",
  personalizing: "bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400",
  reviewing: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500",
  sending: "bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400",
  completed: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
  paused: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",

  // Pipeline stages
  generated: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  qualified: "bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400",
  personalized: "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
  reviewed: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500",
  approved: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
  sent: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
  replied: "bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
  converted: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
  rejected: "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500",
  bounced: "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500",
  failed: "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500",

  // Reply classifications
  positive_interest: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
  interview: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
  pricing: "bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400",
  info_request: "bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400",
  auto_response: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",
  rejection: "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500",
  spam: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",

  // Template categories
  job_application: "bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400",
  startup_founder: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
  recruiter: "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
  freelance: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500",
  agency: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  saas_sales: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
  partnerships: "bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400",
  investor: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500",
  referral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  general_bd: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

const labelOverrides: Record<string, string> = {
  positive_interest: "Positive Interest",
  info_request: "Info Request",
  auto_response: "Auto Response",
  job_application: "Job Application",
  startup_founder: "Startup Founder",
  saas_sales: "SaaS Sales",
  general_bd: "General BD",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = variants[status] || variants.draft;
  const label =
    labelOverrides[status] ||
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium tracking-tight",
        variant,
        className
      )}
    >
      {label}
    </span>
  );
}
