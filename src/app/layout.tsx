import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/client-providers";
import { AppLayout } from "@/components/layout/app-layout";
import { CommandPalette } from "@/components/common/command-palette";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OutReach AI — Personal AI Outbound Workspace",
  description:
    "An AI-powered outbound workspace for lead discovery, personalized outreach, and campaign management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full font-sans antialiased bg-body-bg text-text-primary" suppressHydrationWarning>
        <ClientProviders>
          <AppLayout>{children}</AppLayout>
          <CommandPalette />
        </ClientProviders>
      </body>
    </html>
  );
}
