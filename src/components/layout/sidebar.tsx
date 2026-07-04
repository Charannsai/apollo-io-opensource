"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import {
  LayoutDashboard,
  Layers,
  Search,
  FileText,
  GitBranch,
  Inbox,
  BarChart3,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Sessions", href: "/sessions", icon: Layers },
  { label: "Search", href: "/search", icon: Search },
  { label: "Templates", href: "/templates", icon: FileText },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "flex flex-col h-screen sticky top-0 z-30 select-none border-r transition-all duration-200",
        "bg-sidebar-bg border-sidebar-border"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5.5 h-14 border-b border-sidebar-border">
        <Zap className="w-4 h-4 text-text-primary shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-xs font-semibold tracking-wider text-neutral-900 dark:text-neutral-50 uppercase whitespace-nowrap overflow-hidden"
            >
              OutReach AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-active text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-sidebar-hover"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-text-primary" : "text-text-tertiary group-hover:text-text-secondary"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-0.5">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
            "text-text-secondary hover:text-text-primary hover:bg-sidebar-hover"
          )}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4 shrink-0 text-text-tertiary" />
          ) : (
            <Moon className="w-4 h-4 shrink-0 text-text-tertiary" />
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
            "text-text-secondary hover:text-text-primary hover:bg-sidebar-hover"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0 text-text-tertiary" />
          ) : (
            <ChevronLeft className="w-4 h-4 shrink-0 text-text-tertiary" />
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
