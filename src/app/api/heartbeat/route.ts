import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";

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

interface HeartbeatStore {
  [clientId: string]: Heartbeat;
}

function loadHeartbeats(): HeartbeatStore {
  try {
    if (existsSync(HEARTBEAT_FILE)) {
      return JSON.parse(readFileSync(HEARTBEAT_FILE, "utf-8"));
    }
  } catch {
    // File corrupted or doesn't exist
  }
  return {};
}

function saveHeartbeats(data: HeartbeatStore): void {
  try {
    const dir = dirname(HEARTBEAT_FILE);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(HEARTBEAT_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to save heartbeats:", e);
  }
}

// POST - Client sends heartbeat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, hostname, platform, version, status } = body;

    if (!clientId || !hostname) {
      return NextResponse.json(
        { error: "Missing required fields: clientId, hostname" },
        { status: 400 }
      );
    }

    // Get client IP from request
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";

    const heartbeats = loadHeartbeats();

    heartbeats[clientId] = {
      clientId,
      hostname,
      platform: platform || "unknown",
      version: version || "unknown",
      ip,
      timestamp: new Date().toISOString(),
      status: status || "running",
    };

    saveHeartbeats(heartbeats);

    return NextResponse.json({
      success: true,
      message: "Heartbeat received",
      serverTime: new Date().toISOString()
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// GET - Retrieve all heartbeats (for debugging/admin)
export async function GET() {
  const heartbeats = loadHeartbeats();
  const now = new Date();

  // Add "alive" status based on timestamp (alive if heartbeat within last 2 minutes)
  const enriched = Object.entries(heartbeats).map(([id, hb]) => {
    const lastSeen = new Date(hb.timestamp);
    const diffSeconds = (now.getTime() - lastSeen.getTime()) / 1000;
    return {
      ...hb,
      alive: diffSeconds < 120, // 2 minutes
      lastSeenSeconds: Math.round(diffSeconds),
    };
  });

  return NextResponse.json({ heartbeats: enriched });
}

// DELETE - Remove a client's heartbeat (when client shuts down)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "Missing clientId parameter" },
        { status: 400 }
      );
    }

    const heartbeats = loadHeartbeats();
    delete heartbeats[clientId];
    saveHeartbeats(heartbeats);

    return NextResponse.json({ success: true, message: "Heartbeat removed" });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove heartbeat" },
      { status: 500 }
    );
  }
}
