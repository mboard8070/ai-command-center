"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  Thermometer,
  HardDrive,
  Activity,
  Gauge,
  MemoryStick,
  Wifi,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface SystemStats {
  gpu: {
    name: string;
    temperature: number;
    utilization: number;
    memoryUsed: number;
    memoryTotal: number;
    power: number;
  };
  memory: {
    used: number;
    total: number;
  };
}

export default function SystemPage() {
  const [stats, setStats] = useState<SystemStats>({
    gpu: {
      name: "NVIDIA GB10",
      temperature: 46,
      utilization: 0,
      memoryUsed: 21,
      memoryTotal: 128,
      power: 12,
    },
    memory: {
      used: 57,
      total: 119,
    },
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      const { authFetch } = await import("@/lib/auth"); const response = await authFetch("/api/system");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const tempColor = stats.gpu.temperature < 60 
    ? "text-emerald-400" 
    : stats.gpu.temperature < 80 
      ? "text-amber-400" 
      : "text-red-400";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System</h1>
          <p className="text-zinc-500">Hardware monitoring and diagnostics</p>
        </div>
        <Button 
          variant="outline" 
          className="border-zinc-700"
          onClick={refreshStats}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* GPU Card */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <CardTitle className="text-white">{stats.gpu.name}</CardTitle>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Active
            </Badge>
          </div>
          <CardDescription>DGX Spark • CUDA 13.0 • Grace Blackwell</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Temperature
                </span>
                <span className={`text-2xl font-bold ${tempColor}`}>
                  {stats.gpu.temperature}°C
                </span>
              </div>
              <Progress 
                value={(stats.gpu.temperature / 100) * 100} 
                className="h-2 bg-zinc-800"
              />
              <p className="text-xs text-zinc-500">
                {stats.gpu.temperature < 60 ? "Optimal" : stats.gpu.temperature < 80 ? "Warm" : "Hot"}
              </p>
            </div>

            {/* Utilization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  GPU Utilization
                </span>
                <span className="text-2xl font-bold text-blue-400">
                  {stats.gpu.utilization}%
                </span>
              </div>
              <Progress 
                value={stats.gpu.utilization} 
                className="h-2 bg-zinc-800"
              />
              <p className="text-xs text-zinc-500">
                {stats.gpu.utilization === 0 ? "Idle" : stats.gpu.utilization < 50 ? "Light load" : "Heavy load"}
              </p>
            </div>

            {/* VRAM */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 flex items-center gap-2">
                  <MemoryStick className="h-4 w-4" />
                  VRAM
                </span>
                <span className="text-2xl font-bold text-purple-400">
                  {stats.gpu.memoryUsed}GB
                </span>
              </div>
              <Progress 
                value={(stats.gpu.memoryUsed / stats.gpu.memoryTotal) * 100} 
                className="h-2 bg-zinc-800"
              />
              <p className="text-xs text-zinc-500">
                {stats.gpu.memoryUsed} / {stats.gpu.memoryTotal} GB
              </p>
            </div>

            {/* Power */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Power Draw
                </span>
                <span className="text-2xl font-bold text-amber-400">
                  {stats.gpu.power}W
                </span>
              </div>
              <Progress 
                value={(stats.gpu.power / 200) * 100} 
                className="h-2 bg-zinc-800"
              />
              <p className="text-xs text-zinc-500">Max ~200W</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Memory */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <HardDrive className="h-5 w-5 text-blue-400" />
              System Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">
                  {stats.memory.used}GB
                </span>
                <span className="text-zinc-500">/ {stats.memory.total}GB</span>
              </div>
              <Progress 
                value={(stats.memory.used / stats.memory.total) * 100} 
                className="h-3 bg-zinc-800"
              />
              <p className="text-sm text-zinc-400">
                {stats.memory.total - stats.memory.used}GB available
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wifi className="h-5 w-5 text-emerald-400" />
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Tailscale IP</span>
                <code className="text-sm text-zinc-200 bg-zinc-800 px-2 py-1 rounded">
                  100.107.132.16
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Gateway Port</span>
                <code className="text-sm text-zinc-200 bg-zinc-800 px-2 py-1 rounded">
                  18789
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Status</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
