"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  Monitor,
  Smartphone,
  Laptop,
  Wifi,
  WifiOff,
  RefreshCw,
  Terminal,
  Bell,
  Network,
  LayoutGrid,
  Bot,
  Cpu,
  Play,
  Square,
  CheckCircle,
  XCircle,
  MessageCircle,
  Circle
} from "lucide-react";
import { useEffect, useState } from "react";
import { NodeGraph } from "@/components/node-graph";

interface MaudeStatus {
  installed: boolean;
  running: boolean;
  type: string;
}

interface Node {
  id: string;
  name: string;
  type: string;
  platform: string;
  status: "online" | "offline" | "idle";
  ip?: string;
  lastSeen?: string;
  capabilities?: string[];
  isHub?: boolean;
  description?: string;
  maudeClient?: boolean;
  maudeStatus?: MaudeStatus;
}

interface ServerStatus {
  maudeRunning: boolean;
  nemotronRunning: boolean;
  telegramBotRunning: boolean;
}

const platformIcons: Record<string, typeof Server> = {
  linux: Server,
  windows: Monitor,
  macos: Laptop,
  ios: Smartphone,
  android: Smartphone,
  cli: Terminal,
  telegram: MessageCircle,
};

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"graph" | "grid">("grid");

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNodes = async () => {
    try {
      const { authFetch } = await import("@/lib/auth");
      const response = await authFetch("/api/nodes");
      const data = await response.json();
      setNodes(data.nodes || []);
      setServerStatus(data.serverStatus || null);
    } catch (error) {
      console.error("Failed to fetch nodes:", error);
    }
    setLoading(false);
  };

  const onlineCount = nodes.filter(n => n.status === "online").length;
  const tailscaleNodes = nodes.filter(n => n.type !== "channel");
  const channelNodes = nodes.filter(n => n.type === "channel");

  // Get status label for a node
  const getNodeStatusLabel = (node: Node) => {
    const ms = node.maudeStatus;
    if (!ms) return null;

    if (node.status === "offline") {
      return { label: "Offline", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" };
    }

    switch (ms.type) {
      case "server":
        if (ms.running) {
          return { label: "Server Running", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Play };
        }
        return { label: "Server Stopped", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: Square };

      case "client":
        if (!ms.installed) {
          return { label: "Not Installed", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: XCircle };
        }
        if (ms.running) {
          return { label: "Client Running", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Play };
        }
        return { label: "Client Stopped", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Square };

      case "telegram":
        if (ms.running) {
          return { label: "Telegram Active", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: MessageCircle };
        }
        return { label: "Telegram Idle", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: MessageCircle };

      default:
        return { label: "Device", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Network Nodes</h1>
          <p className="text-zinc-500">
            {onlineCount} of {nodes.length} nodes on Tailscale
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "graph" | "grid")}>
            <TabsList className="bg-zinc-800">
              <TabsTrigger value="graph" className="data-[state=active]:bg-zinc-700">
                <Network className="h-4 w-4 mr-1" />
                Graph
              </TabsTrigger>
              <TabsTrigger value="grid" className="data-[state=active]:bg-zinc-700">
                <LayoutGrid className="h-4 w-4 mr-1" />
                Grid
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" className="border-zinc-700" onClick={fetchNodes}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Server Status Bar */}
      {serverStatus && (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* MAUDE Server */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-800/50">
                <Bot className="h-5 w-5 text-cyan-400" />
                <div>
                  <div className="text-xs text-zinc-500">MAUDE Server</div>
                  <div className="flex items-center gap-1">
                    {serverStatus.maudeRunning ? (
                      <>
                        <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">Running</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-2 w-2 fill-red-400 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Stopped</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Nemotron */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-800/50">
                <Cpu className="h-5 w-5 text-orange-400" />
                <div>
                  <div className="text-xs text-zinc-500">Nemotron LLM</div>
                  <div className="flex items-center gap-1">
                    {serverStatus.nemotronRunning ? (
                      <>
                        <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">Running</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-2 w-2 fill-red-400 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Stopped</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Telegram Bot */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-800/50">
                <MessageCircle className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-xs text-zinc-500">Telegram Bot</div>
                  <div className="flex items-center gap-1">
                    {serverStatus.telegramBotRunning ? (
                      <>
                        <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">Running</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-2 w-2 fill-zinc-400 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-400">Stopped</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Graph View */}
      {view === "graph" && (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white">
              <Network className="h-5 w-5 text-cyan-400" />
              Network Topology
            </CardTitle>
            <CardDescription>
              Drag nodes to rearrange • DGX Spark is the central hub
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            ) : (
              <NodeGraph nodes={nodes} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {view === "grid" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            <>
              {/* Tailscale Machines Section */}
              <div>
                <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                  <Network className="h-5 w-5 text-cyan-400" />
                  Tailscale Machines
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {tailscaleNodes.map((node) => {
                    const Icon = platformIcons[node.platform] || Server;
                    const statusInfo = getNodeStatusLabel(node);
                    const StatusIcon = statusInfo?.icon;

                    return (
                      <Card key={node.id} className="border-zinc-800 bg-zinc-900/50">
                        <CardContent className="pt-4">
                          {/* Header with icon and name */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                              node.status === "online" ? "bg-cyan-500/10" : "bg-zinc-800"
                            }`}>
                              <Icon className={`h-6 w-6 ${
                                node.status === "online" ? "text-cyan-400" : "text-zinc-500"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-zinc-200 truncate flex items-center gap-2">
                                {node.name}
                                {node.isHub && (
                                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">
                                    Hub
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-zinc-500">{node.platform}</div>
                            </div>
                          </div>

                          {/* Tailscale Status */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-zinc-500">Tailscale</span>
                              <Badge className={
                                node.status === "online"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                              }>
                                {node.status === "online" ? (
                                  <Wifi className="mr-1 h-3 w-3" />
                                ) : (
                                  <WifiOff className="mr-1 h-3 w-3" />
                                )}
                                {node.status === "online" ? "Online" : "Offline"}
                              </Badge>
                            </div>

                            {/* MAUDE Status */}
                            {statusInfo && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-zinc-500">MAUDE</span>
                                <Badge className={statusInfo.color}>
                                  {StatusIcon && <StatusIcon className="mr-1 h-3 w-3" />}
                                  {statusInfo.label}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* IP Address */}
                          {node.ip && (
                            <div className="pt-2 border-t border-zinc-800">
                              <code className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded block text-center">
                                {node.ip}
                              </code>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Channels Section */}
              <div>
                <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-purple-400" />
                  Interfaces
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {channelNodes.map((node) => {
                    const Icon = platformIcons[node.platform] || Terminal;

                    return (
                      <Card key={node.id} className="border-zinc-800 bg-zinc-900/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              node.status === "online" ? "bg-purple-500/10" :
                              node.status === "idle" ? "bg-yellow-500/10" : "bg-zinc-800"
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                node.status === "online" ? "text-purple-400" :
                                node.status === "idle" ? "text-yellow-400" : "text-zinc-500"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-zinc-200">{node.name}</div>
                              <div className="text-xs text-zinc-500">{node.description}</div>
                            </div>
                            <Badge className={
                              node.status === "online"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : node.status === "idle"
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }>
                              {node.status === "online" ? "Active" : node.status === "idle" ? "Idle" : "Stopped"}
                            </Badge>
                          </div>
                          {node.lastSeen && (
                            <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                              Last: {new Date(node.lastSeen).toLocaleString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
