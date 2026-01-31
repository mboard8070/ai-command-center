"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  MessageSquare,
  Zap,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  Bot,
  User,
  Code,
  Globe
} from "lucide-react";
import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  type: "message" | "tool" | "cron" | "system";
  channel: string;
  content: string;
  details?: string;
  timestamp: number;
  sessionId?: string;
}

const typeIcons = {
  message: MessageSquare,
  tool: Zap,
  cron: Clock,
  system: Bot,
};

const typeColors = {
  message: "text-blue-400 bg-blue-500/10",
  tool: "text-amber-400 bg-amber-500/10",
  cron: "text-purple-400 bg-purple-500/10",
  system: "text-zinc-400 bg-zinc-500/10",
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivity();
    // Poll for updates
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivity = async () => {
    try {
      const { authFetch } = await import("@/lib/auth"); const response = await authFetch("/api/activity");
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    }
    setLoading(false);
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredActivities = activities.filter(
    (a) => a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity</h1>
          <p className="text-zinc-500">Real-time feed of agent actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-700" onClick={fetchActivity}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search activity..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>

      {/* Activity Feed */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {filteredActivities.map((item) => {
                  const Icon = typeIcons[item.type];
                  const colorClass = typeColors[item.type];
                  const isExpanded = expandedId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-200 truncate">{item.content}</span>
                            <ChevronRight className={`h-4 w-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">
                              {item.channel}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">
                              {item.type}
                            </Badge>
                            <span className="text-xs text-zinc-600">{formatTime(item.timestamp)}</span>
                          </div>

                          {/* Expanded details */}
                          {isExpanded && item.details && (
                            <div className="mt-3 p-3 rounded-lg bg-zinc-800/50">
                              <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono">
                                {item.details}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
