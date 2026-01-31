"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  MessageSquare, 
  Cpu, 
  Thermometer,
  Server,
  Clock,
  Zap,
  TrendingUp
} from "lucide-react";

// Placeholder data - will connect to real API
const stats = [
  {
    name: "Active Sessions",
    value: "3",
    change: "+2 today",
    icon: MessageSquare,
    color: "text-cyan-400",
  },
  {
    name: "GPU Temperature",
    value: "46°C",
    change: "Idle",
    icon: Thermometer,
    color: "text-emerald-400",
  },
  {
    name: "Nodes Online",
    value: "3/3",
    change: "All connected",
    icon: Server,
    color: "text-blue-400",
  },
  {
    name: "Memory Entries",
    value: "24",
    change: "Last updated: now",
    icon: Clock,
    color: "text-amber-400",
  },
];

const recentActivity = [
  { id: 1, type: "message", channel: "telegram", content: "Research world labs.ai...", time: "2 min ago" },
  { id: 2, type: "tool", channel: "system", content: "web_fetch: worldlabs.ai", time: "3 min ago" },
  { id: 3, type: "message", channel: "cli", content: "Context loaded from memory", time: "15 min ago" },
  { id: 4, type: "message", channel: "telegram", content: "AnimateDiff video generated", time: "45 min ago" },
];

const nodes = [
  { name: "spark-e26c", type: "DGX Spark", status: "online", ip: "100.107.132.16" },
  { name: "mattwell", type: "Windows PC", status: "online", ip: "100.104.211.90" },
  { name: "MacBook Pro", type: "macOS", status: "online", ip: "100.90.191.88" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500">Real-time overview of your AI infrastructure</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-zinc-500">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-cyan-400" />
              Recent Activity
            </CardTitle>
            <CardDescription>Live feed of agent actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {item.type === "message" && (
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                    )}
                    {item.type === "tool" && (
                      <Zap className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">{item.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">
                        {item.channel}
                      </Badge>
                      <span className="text-xs text-zinc-600">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nodes Status */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Server className="h-5 w-5 text-blue-400" />
              Nodes
            </CardTitle>
            <CardDescription>Connected infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodes.map((node) => (
                <div key={node.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      node.status === "online" ? "bg-emerald-500" : "bg-zinc-600"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{node.name}</p>
                      <p className="text-xs text-zinc-500">{node.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-zinc-400">
                    {node.ip}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Bar */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">GPU: NVIDIA GB10</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">46°C</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">0% Utilization</span>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              System Healthy
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
