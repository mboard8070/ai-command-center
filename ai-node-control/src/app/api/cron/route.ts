import { NextResponse } from "next/server";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:18789";
const API_TOKEN = process.env.CLAWDBOT_API_TOKEN || "";

export async function GET() {
  try {
    const response = await fetch(`${GATEWAY_URL}/api/cron/list`, {
      headers: {
        ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Gateway error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch cron jobs:", error);
    // Return mock data for development
    return NextResponse.json({
      jobs: [
        {
          id: "1",
          name: "snoogan-startup",
          enabled: true,
          schedule: { kind: "cron", expr: "0 8 * * 1-5" },
          payload: { kind: "systemEvent", text: "Market open startup sequence..." },
          state: { nextRunAtMs: Date.now() + 3600000, lastStatus: "ok" },
        },
        {
          id: "2", 
          name: "x-morning-post",
          enabled: true,
          schedule: { kind: "cron", expr: "0 9 * * 1-5" },
          payload: { kind: "systemEvent", text: "Time for the morning social post (X + Instagram)..." },
          state: { nextRunAtMs: Date.now() + 7200000, lastStatus: "ok" },
        },
        {
          id: "3",
          name: "mochi-retry",
          enabled: true,
          schedule: { kind: "cron", expr: "0 23 * * *" },
          payload: { kind: "systemEvent", text: "Time to retry the Mochi video generation..." },
          state: { nextRunAtMs: Date.now() + 1800000 },
        },
      ],
    });
  }
}
