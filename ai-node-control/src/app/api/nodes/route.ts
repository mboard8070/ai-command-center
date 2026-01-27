import { NextResponse } from "next/server";

// Network topology based on TOOLS.md
const NETWORK_NODES = [
  {
    id: "spark",
    name: "DGX Spark",
    platform: "linux",
    status: "online" as const,
    ip: "100.107.132.16",
    capabilities: ["exec", "gpu", "llm"],
    isHub: true,
  },
  {
    id: "mattwell",
    name: "Mattwell",
    platform: "windows",
    status: "online" as const,
    ip: "100.104.211.90",
    capabilities: ["exec", "notify"],
  },
  {
    id: "macbook",
    name: "MacBook Pro",
    platform: "macos",
    status: "online" as const,
    ip: "100.90.191.88",
    capabilities: ["exec", "notify"],
  },
  {
    id: "iphone",
    name: "iPhone 15 Pro",
    platform: "ios",
    status: "online" as const,
    ip: "100.102.129.39",
    capabilities: ["notify", "camera", "location"],
  },
];

export async function GET() {
  // In a real implementation, this would check actual node status
  // via Clawdbot's nodes API or Tailscale status
  
  // For now, return the static topology
  // You could enhance this with: fetch(`http://localhost:18789/api/nodes/status`)
  
  return NextResponse.json({
    nodes: NETWORK_NODES,
  });
}
