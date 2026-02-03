import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { execSync } from "child_process";

const HEARTBEAT_FILE = join(homedir(), ".config", "maude", "heartbeats.json");

interface Heartbeat {
  clientId: string;
  hostname: string;
  platform: string;
  version?: string;
  ip?: string;
  timestamp: string;
  status: "running" | "stopping";
}

// Load heartbeats from file
function loadHeartbeats(): Record<string, Heartbeat> {
  try {
    if (existsSync(HEARTBEAT_FILE)) {
      return JSON.parse(readFileSync(HEARTBEAT_FILE, "utf-8"));
    }
  } catch {
    // File corrupted or doesn't exist
  }
  return {};
}

// Normalize hostname for comparison (remove special chars, lowercase, remove common suffixes)
function normalizeHostname(hostname: string): string {
  return hostname
    .toLowerCase()
    .replace(/\.local$/, "") // Remove .local suffix
    .replace(/[''`\-_.\s]/g, "") // Remove apostrophes, dashes, dots, spaces
    .replace(/[^a-z0-9]/g, ""); // Remove all remaining non-alphanumeric
}

// Check if a client is alive based on heartbeat (within last 2 minutes)
function isClientAlive(hostname: string): { alive: boolean; lastSeen?: string } {
  const heartbeats = loadHeartbeats();
  const now = new Date();
  const normalizedTarget = normalizeHostname(hostname);

  // Find ALL matching heartbeats, then pick the most recent one
  const matches: Array<{ hb: Heartbeat; timestamp: Date; diffSeconds: number }> = [];

  for (const hb of Object.values(heartbeats)) {
    const normalizedHb = normalizeHostname(hb.hostname);

    // Check if normalized hostnames match or one contains the other
    const shortTarget = normalizedTarget.substring(0, 12);
    const shortHb = normalizedHb.substring(0, 12);

    if (normalizedHb === normalizedTarget ||
        normalizedHb.includes(normalizedTarget) ||
        normalizedTarget.includes(normalizedHb) ||
        shortTarget === shortHb) {
      const timestamp = new Date(hb.timestamp);
      const diffSeconds = (now.getTime() - timestamp.getTime()) / 1000;
      matches.push({ hb, timestamp, diffSeconds });
    }
  }

  if (matches.length === 0) {
    return { alive: false };
  }

  // Sort by timestamp, most recent first
  matches.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const best = matches[0];

  return {
    alive: best.diffSeconds < 120 && best.hb.status === "running",
    lastSeen: best.hb.timestamp,
  };
}

interface TailscalePeer {
  HostName: string;
  DNSName: string;
  OS: string;
  TailscaleIPs: string[];
  Online: boolean;
  LastSeen: string;
}

interface TailscaleStatus {
  Self: TailscalePeer;
  Peer: Record<string, TailscalePeer>;
}

// Check if a channel is active by looking at recent activity
function getChannelActivity(channel: string): { isActive: boolean; lastSeen?: string } {
  const chatLogPath = join(homedir(), ".config", "maude", "chat_sync.jsonl");

  if (!existsSync(chatLogPath)) {
    return { isActive: false };
  }

  try {
    const content = readFileSync(chatLogPath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean).reverse();

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.channel === channel) {
          const timestamp = new Date(entry.ts);
          const now = new Date();
          const diffMinutes = (now.getTime() - timestamp.getTime()) / 60000;
          return {
            isActive: diffMinutes < 5,
            lastSeen: entry.ts,
          };
        }
      } catch {
        continue;
      }
    }
  } catch {
    return { isActive: false };
  }

  return { isActive: false };
}

// Check if a tmux session exists
function checkTmuxSession(sessionName: string): boolean {
  try {
    execSync(`tmux has-session -t ${sessionName} 2>/dev/null`, {
      encoding: "utf-8",
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

// Check if Telegram bot process is running
function checkTelegramBot(): boolean {
  try {
    const result = execSync("pgrep -f 'maude_telegram_service\\|run_telegram' 2>/dev/null", {
      encoding: "utf-8",
      timeout: 5000,
    });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

// Check remote client status via heartbeat
function checkRemoteClient(hostname: string): { installed: boolean; running: boolean; lastSeen?: string } {
  const heartbeat = isClientAlive(hostname);
  return {
    installed: true, // Assume installed if in MAUDE_CLIENTS config
    running: heartbeat.alive,
    lastSeen: heartbeat.lastSeen,
  };
}

// Get Tailscale network status
function getTailscaleStatus(): TailscaleStatus | null {
  try {
    const result = execSync("tailscale status --json", {
      encoding: "utf-8",
      timeout: 10000,
    });
    return JSON.parse(result);
  } catch {
    return null;
  }
}

// Known MAUDE client installations (hostname -> config)
interface ClientConfig {
  hasClient: boolean;
  sshUser?: string;
  sshHost?: string; // Tailscale hostname for SSH
  clientType: "server" | "client" | "telegram" | "none";
}

const MAUDE_CLIENTS: Record<string, ClientConfig> = {
  "spark-e26c": {
    hasClient: true,
    clientType: "server"
  },
  "Matthew\u2019s MacBook Pro": {
    hasClient: true,
    sshUser: "matthew",
    sshHost: "100.90.191.88",
    clientType: "client"
  },
  "Mattwell": {
    hasClient: true,
    sshUser: "mboard76",
    sshHost: "100.104.211.90",
    clientType: "client"
  },
  "localhost": {
    hasClient: false,
    clientType: "telegram" // Uses Telegram to interact
  }
};

// Map OS to platform
function osToPlatform(os: string): string {
  const mapping: Record<string, string> = {
    linux: "linux",
    windows: "windows",
    macOS: "macos",
    iOS: "ios",
    android: "android",
  };
  return mapping[os] || os.toLowerCase();
}

export async function GET() {
  const tailscale = getTailscaleStatus();

  // Server-side checks (fast, local)
  const maudeServerRunning = checkTmuxSession("maude");
  const nemotronRunning = checkTmuxSession("nemo");
  const telegramBotRunning = checkTelegramBot();
  const telegramActivity = getChannelActivity("telegram");
  const cliActivity = getChannelActivity("cli");

  const nodes: Array<{
    id: string;
    name: string;
    type: string;
    platform: string;
    status: "online" | "offline" | "idle";
    ip?: string;
    capabilities: string[];
    isHub?: boolean;
    description?: string;
    lastSeen?: string;
    maudeClient?: boolean;
    maudeStatus?: {
      installed: boolean;
      running: boolean;
      type: string;
    };
  }> = [];

  if (tailscale) {
    // Add self (this machine - the hub/server)
    const self = tailscale.Self;
    nodes.push({
      id: "spark",
      name: self.HostName,
      type: "hub",
      platform: osToPlatform(self.OS),
      status: "online",
      ip: self.TailscaleIPs[0],
      capabilities: ["llm", "gpu", "tools", "vision", "server"],
      isHub: true,
      description: "MAUDE Server - Local LLM inference",
      maudeClient: true,
      maudeStatus: {
        installed: true,
        running: maudeServerRunning && nemotronRunning,
        type: "server",
      },
    });

    // Add peers
    for (const [, peer] of Object.entries(tailscale.Peer)) {
      const clientConfig = MAUDE_CLIENTS[peer.HostName] || { hasClient: false, clientType: "none" };

      let maudeStatus = {
        installed: clientConfig.hasClient,
        running: false,
        type: clientConfig.clientType,
      };

      // Check status based on client type
      if (clientConfig.clientType === "telegram") {
        // For iPhone/mobile - check if Telegram bot is running and active
        maudeStatus = {
          installed: true, // Telegram app assumed installed
          running: telegramBotRunning && telegramActivity.isActive,
          type: "telegram",
        };
      } else if (clientConfig.clientType === "client" && peer.Online) {
        // For Mac/PC - check via heartbeat
        const remoteStatus = checkRemoteClient(peer.HostName);
        maudeStatus = {
          installed: clientConfig.hasClient,
          running: remoteStatus.running,
          type: "client",
        };
      }

      nodes.push({
        id: peer.HostName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        name: peer.HostName,
        type: clientConfig.hasClient ? "client" : "device",
        platform: osToPlatform(peer.OS),
        status: peer.Online ? "online" : "offline",
        ip: peer.TailscaleIPs?.[0],
        capabilities: getCapabilities(peer.OS, clientConfig.hasClient, clientConfig.clientType),
        description: getDescription(clientConfig.clientType),
        maudeClient: clientConfig.hasClient || clientConfig.clientType === "telegram",
        maudeStatus,
        lastSeen: peer.LastSeen,
      });
    }
  } else {
    // Fallback if Tailscale unavailable
    nodes.push({
      id: "spark",
      name: "DGX Spark",
      type: "hub",
      platform: "linux",
      status: "online",
      capabilities: ["llm", "gpu", "tools", "vision", "server"],
      isHub: true,
      description: "MAUDE Server - Local LLM inference",
      maudeClient: true,
      maudeStatus: {
        installed: true,
        running: maudeServerRunning && nemotronRunning,
        type: "server",
      },
    });
  }

  // Add channel nodes
  nodes.push({
    id: "tui",
    name: "Terminal UI",
    type: "channel",
    platform: "cli",
    status: cliActivity.isActive ? "online" : "idle",
    capabilities: ["chat", "tools"],
    lastSeen: cliActivity.lastSeen,
    description: "Textual TUI interface",
  });

  nodes.push({
    id: "telegram",
    name: "Telegram Bot",
    type: "channel",
    platform: "telegram",
    status: telegramBotRunning ? (telegramActivity.isActive ? "online" : "idle") : "offline",
    capabilities: ["chat", "tools", "mobile"],
    lastSeen: telegramActivity.lastSeen,
    description: telegramBotRunning ? "Bot running on server" : "Bot not running",
    maudeStatus: {
      installed: true,
      running: telegramBotRunning,
      type: "telegram-bot",
    },
  });

  return NextResponse.json({
    nodes,
    serverStatus: {
      maudeRunning: maudeServerRunning,
      nemotronRunning,
      telegramBotRunning,
    }
  });
}

function getCapabilities(os: string, hasClient: boolean, clientType: string): string[] {
  const caps: string[] = [];

  if (hasClient || clientType === "telegram") {
    caps.push("maude");
  }

  if (hasClient && clientType === "client") {
    caps.push("chat", "tools", "local-files");
  }

  switch (os) {
    case "iOS":
    case "android":
      caps.push("mobile", "notify", "telegram");
      break;
    case "macOS":
    case "windows":
    case "linux":
      caps.push("exec", "notify");
      break;
  }

  return caps;
}

function getDescription(clientType: string): string {
  switch (clientType) {
    case "server":
      return "MAUDE Server";
    case "client":
      return "MAUDE Client";
    case "telegram":
      return "Telegram User";
    default:
      return "Tailscale device";
  }
}
