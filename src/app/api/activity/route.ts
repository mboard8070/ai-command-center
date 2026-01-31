import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "50");

  const chatLogPath = join(homedir(), ".config", "maude", "chat_sync.jsonl");

  if (!existsSync(chatLogPath)) {
    return NextResponse.json({ activities: [] });
  }

  try {
    const content = readFileSync(chatLogPath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);

    // Parse and transform to activity format
    const activities = lines
      .map((line, index) => {
        try {
          const entry = JSON.parse(line);
          return {
            id: String(index),
            type: "message",
            channel: entry.channel || "cli",
            role: entry.role,
            content: entry.content,
            timestamp: new Date(entry.ts).getTime(),
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse() // Most recent first
      .slice(0, limit);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error reading activity log:", error);
    return NextResponse.json({ activities: [] });
  }
}
