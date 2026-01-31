import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

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
            isActive: diffMinutes < 5, // Active if message in last 5 minutes
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

export async function GET() {
  const cliActivity = getChannelActivity("cli");
  const telegramActivity = getChannelActivity("telegram");

  const nodes = [
    {
      id: "spark",
      name: "DGX Spark",
      type: "hub",
      platform: "linux",
      status: "online" as const,
      capabilities: ["llm", "gpu", "tools", "vision"],
      isHub: true,
      description: "MAUDE Core - Local LLM inference",
    },
    {
      id: "tui",
      name: "Terminal UI",
      type: "channel",
      platform: "cli",
      status: cliActivity.isActive ? "online" : "idle" as const,
      capabilities: ["chat", "tools"],
      lastSeen: cliActivity.lastSeen,
      description: "Textual TUI interface",
    },
    {
      id: "telegram",
      name: "Telegram",
      type: "channel",
      platform: "telegram",
      status: telegramActivity.isActive ? "online" : "idle" as const,
      capabilities: ["chat", "tools", "mobile"],
      lastSeen: telegramActivity.lastSeen,
      description: "Telegram bot interface",
    },
  ];

  return NextResponse.json({ nodes });
}
