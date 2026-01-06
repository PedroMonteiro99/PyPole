"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Flag,
  Gauge,
  GitCompare,
  Home,
  LogOut,
  Settings,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { F1Logo } from "./F1Logo";
import { Button } from "./ui/button";

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

export function Sidebar() {
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
    <aside className="w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <F1Logo className="h-6 w-auto text-primary mr-2" />
          <span className="text-xl font-bold">PyPole</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
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
    </aside>
  );
}
