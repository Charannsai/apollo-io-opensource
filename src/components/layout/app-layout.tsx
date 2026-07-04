"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { PageTransition } from "./page-transition";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInbox = pathname === "/inbox";

  if (isInbox) {
    return (
      <main className="w-screen h-screen overflow-hidden bg-body-bg">
        <PageTransition>{children}</PageTransition>
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-body-bg">
        <div className="max-w-6xl mx-auto px-6 py-8 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
