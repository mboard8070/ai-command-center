"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Server, 
  Monitor,
  Smartphone,
  Laptop,
  Wifi,
  WifiOff,
  RefreshCw,
  Terminal,
  Camera,
  MapPin,
  Bell,
  Network,
  LayoutGrid
} from "lucide-react";
import { useEffect, useState } from "react";
import { NodeGraph } from "@/components/node-graph";

interface Node {
  id: string;
  name: string;
  platform: string;
  status: "online" | "offline";
  ip?: string;
  lastSeen?: number;
  capabilities?: string[];
  isHub?: boolean;
}

const platformIcons: Record<string, typeof Server> = {
  linux: Server,
  windows: Monitor,
  macos: Laptop,
  ios: Smartphone,
  android: Smartphone,
};

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"graph" | "grid">("graph");

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      const response = await fetch("/api/nodes");
      const data = await response.json();
      setNodes(data.nodes || []);
    } catch (error) {
      console.error("Failed to fetch nodes:", error);
    }
    setLoading(false);
  };

  const sendNotification = async (nodeId: string) => {
    try {
      await fetch(`/api/nodes/${nodeId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test", body: "Notification from AI Command Center" }),
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  const onlineCount = nodes.filter(n => n.status === "online").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Network Nodes</h1>
          <p className="text-zinc-500">
            {onlineCount} of {nodes.length} nodes online
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {nodes.map((node) => {
                const Icon = platformIcons[node.platform] || Server;
                return (
                  <Card key={node.id} className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                            node.status === "online" ? "bg-emerald-500/10" : "bg-zinc-800"
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              node.status === "online" ? "text-emerald-400" : "text-zinc-500"
                            }`} />
                          </div>
                          <div>
                            <CardTitle className="text-base text-zinc-200">
                              {node.name}
                              {node.isHub && (
                                <Badge className="ml-2 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                                  Hub
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs">{node.platform}</CardDescription>
                          </div>
                        </div>
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
                          {node.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* IP Address */}
                      {node.ip && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500">Tailscale IP</span>
                          <code className="text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded text-xs">
                            {node.ip}
                          </code>
                        </div>
                      )}

                      {/* Capabilities */}
                      {node.capabilities && node.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {node.capabilities.includes("exec") && (
                            <Badge variant="outline" className="text-xs border-zinc-700">
                              <Terminal className="mr-1 h-3 w-3" />
                              Exec
                            </Badge>
                          )}
                          {node.capabilities.includes("camera") && (
                            <Badge variant="outline" className="text-xs border-zinc-700">
                              <Camera className="mr-1 h-3 w-3" />
                              Camera
                            </Badge>
                          )}
                          {node.capabilities.includes("location") && (
                            <Badge variant="outline" className="text-xs border-zinc-700">
                              <MapPin className="mr-1 h-3 w-3" />
                              Location
                            </Badge>
                          )}
                          {node.capabilities.includes("notify") && (
                            <Badge variant="outline" className="text-xs border-zinc-700">
                              <Bell className="mr-1 h-3 w-3" />
                              Notify
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-zinc-700"
                          onClick={() => sendNotification(node.id)}
                          disabled={node.status !== "online"}
                        >
                          <Bell className="mr-1 h-3 w-3" />
                          Ping
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-zinc-700"
                          disabled={node.status !== "online"}
                        >
                          <Terminal className="mr-1 h-3 w-3" />
                          Exec
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
}
