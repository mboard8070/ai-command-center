"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Clock,
  Server,
  Activity,
  Settings,
  Brain,
  Cpu,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Sessions", href: "/sessions", icon: MessageSquare },
  { name: "Cron Jobs", href: "/cron", icon: Clock },
  { name: "Nodes", href: "/nodes", icon: Server },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Memory", href: "/memory", icon: Brain },
  { name: "System", href: "/system", icon: Cpu },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900/50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
          <Cpu className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-white">AI Command Center</h1>
          <p className="text-xs text-zinc-500">Clawdbot Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-800 text-cyan-400"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-zinc-500">Gateway Connected</span>
        </div>
      </div>
    </div>
  );
}
