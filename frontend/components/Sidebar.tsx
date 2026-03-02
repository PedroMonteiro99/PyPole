"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Flag,
  Gauge,
  GitCompare,
  Home,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  Trophy,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { F1Logo } from "./F1Logo";

const menuItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/race-weekend", label: "Race Weekend", icon: Flag },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/comparison", label: "Compare", icon: GitCompare },
  { href: "/race", label: "Race Analysis", icon: BarChart3 },
  { href: "/strategy", label: "Strategy", icon: Gauge },
  { href: "/predictor", label: "Predictor", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarContentProps {
  readonly onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: Readonly<SidebarContentProps>) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("first_login");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <F1Logo className="h-6 w-auto text-primary" />
          <span className="text-xl font-bold">PyPole</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href + "/"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          PyPole F1 Analytics
          <br />
          Powered by FastF1 & Jolpica
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r bg-card flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-2">
          <F1Logo className="h-5 w-auto text-primary" />
          <span className="text-lg font-bold">PyPole</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-end px-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="h-[calc(100%-3.5rem)] overflow-y-auto">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>
    </>
  );
}
