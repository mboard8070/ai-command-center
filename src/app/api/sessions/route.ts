import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const DB_PATH = join(homedir(), ".config", "maude", "memory.db");

export async function GET() {
  if (!existsSync(DB_PATH)) {
    return NextResponse.json({ sessions: [] });
  }

  try {
    const db = new Database(DB_PATH, { readonly: true });

    // Get session summaries from conversations table
    const sessions = db.prepare(`
      SELECT
        session_id,
        channel,
        MIN(timestamp) as started_at,
        MAX(timestamp) as last_message_at,
        COUNT(*) as message_count
      FROM conversations
      GROUP BY session_id, channel
      ORDER BY last_message_at DESC
      LIMIT 20
    `).all();

    // Get the last message for each session
    const sessionsWithLastMessage = (sessions as Array<Record<string, unknown>>).map((session) => {
      const lastMessage = db.prepare(`
        SELECT content, role
        FROM conversations
        WHERE session_id = ? AND channel = ?
        ORDER BY timestamp DESC
        LIMIT 1
      `).get(session.session_id, session.channel) as { content: string; role: string } | undefined;

      return {
        id: `${session.channel}:${session.session_id}`,
        sessionId: session.session_id,
        channel: session.channel,
        startedAt: session.started_at,
        lastMessageAt: session.last_message_at,
        messageCount: session.message_count,
        lastMessage: lastMessage?.content?.slice(0, 100) || "",
        lastRole: lastMessage?.role || "user",
      };
    });

    db.close();

    return NextResponse.json({ sessions: sessionsWithLastMessage });
  } catch (error) {
    console.error("Error reading sessions:", error);
    return NextResponse.json({ sessions: [], error: String(error) });
  }
}
