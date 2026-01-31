import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const SCHEDULES_PATH = join(homedir(), ".config", "maude", "schedules.json");

// Map cron shortcuts to their expressions
const SPECIAL_SCHEDULES: Record<string, string> = {
  "@hourly": "0 * * * *",
  "@daily": "0 9 * * *",
  "@weekly": "0 9 * * 1",
  "@monthly": "0 9 1 * *",
  "@morning": "0 8 * * *",
  "@evening": "0 18 * * *",
  "@workdays": "0 9 * * 1-5",
};

// Convert cron expression to human-readable format
function cronToHuman(cron: string): string {
  // Handle shortcuts
  if (cron.startsWith("@")) {
    const shortcuts: Record<string, string> = {
      "@hourly": "Every hour",
      "@daily": "Daily at 9:00 AM",
      "@weekly": "Weekly on Monday at 9:00 AM",
      "@monthly": "Monthly on the 1st at 9:00 AM",
      "@morning": "Daily at 8:00 AM",
      "@evening": "Daily at 6:00 PM",
      "@workdays": "Weekdays at 9:00 AM",
    };
    return shortcuts[cron] || cron;
  }

  const parts = cron.split(" ");
  if (parts.length !== 5) return cron;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Handle common patterns
  if (minute.startsWith("*/")) {
    const interval = minute.slice(2);
    return `Every ${interval} minutes`;
  }

  if (hour === "*" && minute !== "*") {
    return `Every hour at :${minute.padStart(2, "0")}`;
  }

  if (dayOfWeek === "1-5" && hour !== "*") {
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `Weekdays at ${hour12}:${minute.padStart(2, "0")} ${ampm}`;
  }

  if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*" && hour !== "*") {
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `Daily at ${hour12}:${minute.padStart(2, "0")} ${ampm}`;
  }

  if (dayOfWeek !== "*" && dayOfMonth === "*") {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayNum = parseInt(dayOfWeek);
    const dayName = days[dayNum] || dayOfWeek;
    if (hour !== "*") {
      const h = parseInt(hour);
      const ampm = h >= 12 ? "PM" : "AM";
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${dayName}s at ${hour12}:${minute.padStart(2, "0")} ${ampm}`;
    }
    return `Every ${dayName}`;
  }

  return cron;
}

// Calculate time until next run
function getTimeUntilNextRun(nextRun: string | null): string {
  if (!nextRun) return "Not scheduled";

  try {
    const next = new Date(nextRun);
    const now = new Date();
    const diff = next.getTime() - now.getTime();

    if (diff < 0) return "Overdue";

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `in ${days}d ${hours % 24}h`;
    if (hours > 0) return `in ${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `in ${minutes}m`;
    return "< 1 minute";
  } catch {
    return "Unknown";
  }
}

interface ScheduledTask {
  id: string;
  name: string;
  cron: string;
  prompt: string;
  channel: string;
  channel_id: string;
  enabled: boolean;
  last_run: string | null;
  next_run: string | null;
  run_count: number;
  last_result: string | null;
}

export async function GET() {
  if (!existsSync(SCHEDULES_PATH)) {
    return NextResponse.json({
      tasks: [],
      stats: { total: 0, active: 0, totalRuns: 0 }
    });
  }

  try {
    const data = readFileSync(SCHEDULES_PATH, "utf-8");
    const tasks: ScheduledTask[] = JSON.parse(data);

    // Enrich tasks with human-readable info
    const enrichedTasks = tasks.map((task) => ({
      ...task,
      scheduleHuman: cronToHuman(task.cron),
      cronResolved: SPECIAL_SCHEDULES[task.cron] || task.cron,
      timeUntilNextRun: getTimeUntilNextRun(task.next_run),
    }));

    // Calculate stats
    const stats = {
      total: tasks.length,
      active: tasks.filter((t) => t.enabled).length,
      totalRuns: tasks.reduce((sum, t) => sum + (t.run_count || 0), 0),
    };

    return NextResponse.json({
      tasks: enrichedTasks,
      stats
    });
  } catch (error) {
    console.error("Error reading schedules:", error);
    return NextResponse.json({
      tasks: [],
      stats: { total: 0, active: 0, totalRuns: 0 },
      error: String(error)
    });
  }
}
