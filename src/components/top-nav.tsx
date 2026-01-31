"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Server,
  Activity,
  Settings,
  Brain,
  Cpu,
  Shield,
  Clock,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Sessions", href: "/sessions", icon: MessageSquare },
  { name: "Nodes", href: "/nodes", icon: Server },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Memory", href: "/memory", icon: Brain },
  { name: "Scheduler", href: "/scheduler", icon: Clock },
  { name: "System", href: "/system", icon: Cpu },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
      {/* Logo Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">
              MAUDE
              <span className="text-zinc-500 font-normal text-sm ml-2">Command Center</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-zinc-500">MAUDE Online</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="flex items-center gap-1 px-4 overflow-x-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap",
                isActive
                  ? "border-cyan-500 text-cyan-400 bg-cyan-500/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
