import { NextResponse } from "next/server";

export async function GET() {
  // Mock activity data for now
  // In production, this would connect to gateway WebSocket or polling endpoint
  const now = Date.now();
  
  return NextResponse.json({
    activities: [
      {
        id: "1",
        type: "message",
        channel: "telegram",
        content: "ok, so the clawd web dashboard isn't great...",
        timestamp: now - 120000,
        sessionId: "telegram:7941965932",
      },
      {
        id: "2",
        type: "tool",
        channel: "system",
        content: "web_fetch: github.com/luccast/crabwalk",
        details: '{\n  "url": "https://github.com/luccast/crabwalk",\n  "status": 200\n}',
        timestamp: now - 180000,
      },
      {
        id: "3",
        type: "message",
        channel: "telegram",
        content: "can you research world labs.ai",
        timestamp: now - 300000,
        sessionId: "telegram:7941965932",
      },
      {
        id: "4",
        type: "tool",
        channel: "system",
        content: "web_fetch: worldlabs.ai/blog/announcing-the-world-api",
        details: '{\n  "title": "Announcing the World API",\n  "length": 6834\n}',
        timestamp: now - 360000,
      },
      {
        id: "5",
        type: "cron",
        channel: "system",
        content: "mochi-retry scheduled for 11pm",
        timestamp: now - 900000,
      },
      {
        id: "6",
        type: "tool",
        channel: "system",
        content: "exec: AnimateDiff video generation",
        details: "Generated mesh_4sec_00001.mp4\nPeak temp: 68°C\nDuration: 4 seconds",
        timestamp: now - 2700000,
      },
      {
        id: "7",
        type: "message",
        channel: "telegram",
        content: "lets try animate diff with comfyui",
        timestamp: now - 3000000,
        sessionId: "telegram:7941965932",
      },
      {
        id: "8",
        type: "system",
        channel: "system",
        content: "ComfyUI started on port 8188",
        timestamp: now - 3300000,
      },
    ],
  });
}
