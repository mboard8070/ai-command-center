"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Cpu, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GpuProcess {
  pid: number;
  name: string;
  memory: number; // in MB
  type: string;
  color: string;
}

interface GpuMemoryData {
  total: number; // in MB
  used: number;
  free: number;
  processes: GpuProcess[];
}

// Color palette for processes
const processColors = [
  "#8b5cf6", // purple - LLMs
  "#06b6d4", // cyan - Python/ML
  "#f97316", // orange - Other compute
  "#ec4899", // pink
  "#22c55e", // green
  "#eab308", // yellow
  "#ef4444", // red
  "#3b82f6", // blue
];

// Map common process names to friendly labels
function getProcessLabel(name: string): string {
  if (name.includes("llama-server") || name.includes("llama.cpp")) return "Llama Server";
  if (name.includes("python")) return "Python (ML)";
  if (name.includes("Xorg")) return "Display Server";
  if (name.includes("gnome-shell")) return "Desktop";
  return name.split("/").pop()?.slice(0, 20) || name;
}

function DonutChart({ data, size = 200 }: { data: GpuMemoryData; size?: number }) {
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = outerRadius * 0.65;
  
  // Calculate segments
  const total = data.total;
  let currentAngle = -Math.PI / 2; // Start from top
  
  const segments = data.processes.map((proc, i) => {
    const percentage = proc.memory / total;
    const angle = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    // Calculate arc path
    const x1 = centerX + outerRadius * Math.cos(startAngle);
    const y1 = centerY + outerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(endAngle);
    const y2 = centerY + outerRadius * Math.sin(endAngle);
    const x3 = centerX + innerRadius * Math.cos(endAngle);
    const y3 = centerY + innerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(startAngle);
    const y4 = centerY + innerRadius * Math.sin(startAngle);
    
    const largeArc = angle > Math.PI ? 1 : 0;
    
    const path = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      "Z"
    ].join(" ");
    
    return { ...proc, path, percentage };
  });
  
  // Free memory segment
  const freePercentage = data.free / total;
  if (freePercentage > 0.01) {
    const angle = freePercentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + outerRadius * Math.cos(startAngle);
    const y1 = centerY + outerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(endAngle);
    const y2 = centerY + outerRadius * Math.sin(endAngle);
    const x3 = centerX + innerRadius * Math.cos(endAngle);
    const y3 = centerY + innerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(startAngle);
    const y4 = centerY + innerRadius * Math.sin(startAngle);
    
    const largeArc = angle > Math.PI ? 1 : 0;
    
    segments.push({
      pid: 0,
      name: "Free",
      memory: data.free,
      type: "free",
      color: "#27272a",
      path: [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
        "Z"
      ].join(" "),
      percentage: freePercentage,
    });
  }
  
  const usedPercent = Math.round((data.used / data.total) * 100);
  
  return (
    <svg width={size} height={size} className="drop-shadow-lg">
      {/* Glow filter */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background ring */}
      <circle
        cx={centerX}
        cy={centerY}
        r={(outerRadius + innerRadius) / 2}
        fill="none"
        stroke="#18181b"
        strokeWidth={outerRadius - innerRadius}
      />
      
      {/* Segments */}
      {segments.map((seg, i) => (
        <path
          key={seg.pid || `free-${i}`}
          d={seg.path}
          fill={seg.color}
          stroke="#09090b"
          strokeWidth="1"
          className="transition-opacity hover:opacity-80 cursor-pointer"
          filter={seg.type !== "free" ? "url(#glow)" : undefined}
        >
          <title>{`${getProcessLabel(seg.name)}: ${(seg.memory / 1024).toFixed(1)} GB (${(seg.percentage * 100).toFixed(1)}%)`}</title>
        </path>
      ))}
      
      {/* Center text */}
      <text
        x={centerX}
        y={centerY - 10}
        textAnchor="middle"
        className="fill-white text-2xl font-bold"
        style={{ fontSize: "24px", fontWeight: "bold" }}
      >
        {usedPercent}%
      </text>
      <text
        x={centerX}
        y={centerY + 14}
        textAnchor="middle"
        className="fill-zinc-400 text-sm"
        style={{ fontSize: "12px" }}
      >
        {(data.used / 1024).toFixed(1)} / {(data.total / 1024).toFixed(0)} GB
      </text>
    </svg>
  );
}

export function GpuMemoryChart() {
  const [data, setData] = useState<GpuMemoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredProcess, setHoveredProcess] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gpu-processes");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch GPU data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Cpu className="h-5 w-5 text-purple-400" />
            GPU Memory
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Cpu className="h-5 w-5 text-purple-400" />
              GPU Memory Usage
            </CardTitle>
            <CardDescription>What's consuming GPU memory</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Donut Chart */}
          <div className="flex-shrink-0">
            <DonutChart data={data} size={220} />
          </div>
          
          {/* Process List */}
          <div className="flex-1 w-full space-y-2">
            {data.processes.map((proc, i) => (
              <div
                key={proc.pid}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  hoveredProcess === proc.pid ? "bg-zinc-800" : "bg-zinc-900"
                }`}
                onMouseEnter={() => setHoveredProcess(proc.pid)}
                onMouseLeave={() => setHoveredProcess(null)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: proc.color }}
                  />
                  <div>
                    <div className="text-sm font-medium text-zinc-200">
                      {getProcessLabel(proc.name)}
                    </div>
                    <div className="text-xs text-zinc-500">
                      PID: {proc.pid} • {proc.type}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-white">
                    {(proc.memory / 1024).toFixed(1)} GB
                  </div>
                  <div className="text-xs text-zinc-500">
                    {((proc.memory / data.total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
            
            {/* Free memory */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="text-sm text-zinc-400">Available</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-zinc-400">
                  {(data.free / 1024).toFixed(1)} GB
                </div>
                <div className="text-xs text-zinc-500">
                  {((data.free / data.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
