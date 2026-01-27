// Clawdbot Gateway API client

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:18789";
const API_TOKEN = process.env.CLAWDBOT_API_TOKEN || "";

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function gatewayFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_TOKEN) {
    headers["Authorization"] = `Bearer ${API_TOKEN}`;
  }

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers,
  };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${GATEWAY_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    throw new Error(`Gateway API error: ${response.status}`);
  }

  return response.json();
}

// Session types
export interface Session {
  sessionKey: string;
  agentId: string;
  kind: string;
  channel?: string;
  createdAtMs: number;
  lastActiveMs: number;
  messageCount: number;
}

export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr?: string;
  };
  payload: {
    kind: string;
    text: string;
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
  };
}

export interface Node {
  id: string;
  name: string;
  platform: string;
  status: "online" | "offline";
  lastSeen?: number;
}

// API functions
export async function getSessions(): Promise<Session[]> {
  return gatewayFetch<Session[]>("/api/sessions");
}

export async function getCronJobs(): Promise<CronJob[]> {
  const response = await gatewayFetch<{ jobs: CronJob[] }>("/api/cron/list");
  return response.jobs;
}

export async function getNodes(): Promise<Node[]> {
  return gatewayFetch<Node[]>("/api/nodes");
}

export async function getSystemStats() {
  // This will be called from server-side to get GPU stats
  return {
    gpu: {
      name: "NVIDIA GB10",
      temperature: 46,
      utilization: 0,
      memoryUsed: 0,
      memoryTotal: 128,
    },
    cpu: {
      usage: 5,
      cores: 12,
    },
    memory: {
      used: 57,
      total: 119,
    },
  };
}
