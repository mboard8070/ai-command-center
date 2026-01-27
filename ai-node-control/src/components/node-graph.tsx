"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Server, Monitor, Laptop, Smartphone, Wifi, WifiOff, Cpu } from "lucide-react";

interface NetworkNode {
  id: string;
  name: string;
  platform: string;
  status: "online" | "offline";
  ip?: string;
  x: number;
  y: number;
  capabilities?: string[];
  isHub?: boolean;
}

interface Connection {
  from: string;
  to: string;
  active: boolean;
}

const platformIcons: Record<string, typeof Server> = {
  linux: Server,
  windows: Monitor,
  macos: Laptop,
  ios: Smartphone,
  android: Smartphone,
};

const platformColors: Record<string, { bg: string; border: string; text: string }> = {
  linux: { bg: "bg-orange-500/10", border: "border-orange-500/40", text: "text-orange-400" },
  windows: { bg: "bg-blue-500/10", border: "border-blue-500/40", text: "text-blue-400" },
  macos: { bg: "bg-zinc-500/10", border: "border-zinc-500/40", text: "text-zinc-300" },
  ios: { bg: "bg-purple-500/10", border: "border-purple-500/40", text: "text-purple-400" },
  android: { bg: "bg-green-500/10", border: "border-green-500/40", text: "text-green-400" },
};

// Calculate initial positions in a circle around a hub
function layoutNodes(nodes: Omit<NetworkNode, "x" | "y">[], width: number, height: number): NetworkNode[] {
  const hubNode = nodes.find(n => n.isHub);
  const otherNodes = nodes.filter(n => !n.isHub);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.32;
  
  const result: NetworkNode[] = [];
  
  // Place hub in center
  if (hubNode) {
    result.push({ ...hubNode, x: centerX - 80, y: centerY - 50 });
  }
  
  // Place other nodes in a circle
  otherNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / otherNodes.length - Math.PI / 2;
    result.push({
      ...node,
      x: centerX + radius * Math.cos(angle) - 80,
      y: centerY + radius * Math.sin(angle) - 50,
    });
  });
  
  return result;
}

// Animated flowing dots on connections
function ConnectionLine({ x1, y1, x2, y2, active }: { x1: number; y1: number; x2: number; y2: number; active: boolean }) {
  const lineColor = active ? "#22c55e" : "#3f3f46";
  const glowColor = active ? "#22c55e40" : "transparent";
  
  // Calculate control points for a curved line
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = Math.min(dist * 0.15, 40);
  
  // Perpendicular offset for curve
  const nx = -dy / dist * curvature;
  const ny = dx / dist * curvature;
  
  const path = `M ${x1} ${y1} Q ${midX + nx} ${midY + ny} ${x2} ${y2}`;
  
  return (
    <g>
      {/* Glow effect */}
      <path
        d={path}
        fill="none"
        stroke={glowColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={active ? "none" : "5,5"}
      />
      {/* Animated flowing dots for active connections */}
      {active && (
        <>
          <circle r="4" fill="#22c55e">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={path}
            />
          </circle>
          <circle r="4" fill="#22c55e">
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              begin="1s"
              path={path}
            />
          </circle>
        </>
      )}
    </g>
  );
}

export function NodeGraph({ nodes: inputNodes }: { nodes: Omit<NetworkNode, "x" | "y">[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Connections: everything connects to the hub (DGX Spark)
  const connections: Connection[] = nodes
    .filter(n => !n.isHub)
    .map(n => ({
      from: "spark",
      to: n.id,
      active: n.status === "online" && nodes.find(h => h.isHub)?.status === "online",
    }));

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: Math.max(500, rect.height) });
    }
  }, []);

  useEffect(() => {
    if (inputNodes.length > 0 && dimensions.width > 0) {
      setNodes(layoutNodes(inputNodes, dimensions.width, dimensions.height));
    }
  }, [inputNodes, dimensions]);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragging(nodeId);
      setOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      });
    }
  }, [nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      setNodes(prev => prev.map(n => 
        n.id === dragging 
          ? { ...n, x: e.clientX - offset.x, y: e.clientY - offset.y }
          : n
      ));
    }
  }, [dragging, offset]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Get node center for connection points
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + 80, y: node.y + 50 };
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Connection lines */}
        {connections.map(conn => {
          const from = getNodeCenter(conn.from);
          const to = getNodeCenter(conn.to);
          return (
            <ConnectionLine
              key={`${conn.from}-${conn.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              active={conn.active}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => {
        const Icon = platformIcons[node.platform] || Server;
        const colors = platformColors[node.platform] || platformColors.linux;
        const isOnline = node.status === "online";
        
        return (
          <div
            key={node.id}
            className={`absolute select-none cursor-move transition-shadow ${
              dragging === node.id ? "z-20 shadow-2xl" : "z-10"
            }`}
            style={{ left: node.x, top: node.y }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          >
            {/* ComfyUI-style node */}
            <div className={`w-40 rounded-lg border-2 ${colors.border} ${colors.bg} backdrop-blur-sm`}>
              {/* Header */}
              <div className={`px-3 py-2 border-b ${colors.border} flex items-center gap-2`}>
                <Icon className={`h-4 w-4 ${colors.text}`} />
                <span className={`text-sm font-medium ${colors.text} truncate`}>
                  {node.name}
                </span>
              </div>
              
              {/* Body */}
              <div className="px-3 py-2 space-y-2">
                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                  }`} />
                  <span className="text-xs text-zinc-400">
                    {isOnline ? "Connected" : "Offline"}
                  </span>
                </div>
                
                {/* IP Address (connection point style) */}
                {node.ip && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500/50 border border-cyan-500" />
                    <code className="text-xs text-cyan-400">{node.ip}</code>
                  </div>
                )}
                
                {/* Platform */}
                <div className="text-xs text-zinc-500 capitalize">
                  {node.platform}
                </div>
              </div>
              
              {/* Input/Output ports (ComfyUI style) */}
              {node.isHub ? (
                <>
                  {/* Output ports on the right for hub */}
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-zinc-900 shadow-lg" 
                         title="Network Output" />
                  </div>
                </>
              ) : (
                <>
                  {/* Input port on the left for other nodes */}
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                    <div className={`w-4 h-4 rounded-full border-2 border-zinc-900 shadow-lg ${
                      isOnline ? "bg-emerald-500" : "bg-zinc-600"
                    }`} title="Network Input" />
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <span>Offline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-emerald-500" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-zinc-600 border-dashed" style={{ borderTop: "2px dashed #3f3f46" }} />
          <span>Inactive</span>
        </div>
      </div>
    </div>
  );
}
