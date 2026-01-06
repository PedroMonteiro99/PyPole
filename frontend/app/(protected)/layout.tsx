"use client";

import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTeamTheme } from "@/hooks/useTeamTheme";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load team theme on mount
  useTeamTheme();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

