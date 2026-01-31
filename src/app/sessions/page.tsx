"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Clock,
  Terminal,
  Send,
  Bot
} from "lucide-react";
import { useState, useEffect } from "react";

interface Session {
  id: string;
  sessionId: string;
  channel: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  lastMessage: string;
  lastRole: string;
}

const channelColors: Record<string, string> = {
  cli: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  telegram: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  system: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const channelIcons: Record<string, React.ReactNode> = {
  cli: <Terminal className="h-5 w-5 text-emerald-400" />,
  telegram: <Send className="h-5 w-5 text-blue-400" />,
  system: <Bot className="h-5 w-5 text-zinc-400" />,
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch("/api/sessions");
        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(
    (s) =>
      s.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sessions</h1>
          <p className="text-zinc-500">Conversation history across all channels</p>
        </div>
        <Button variant="outline" className="border-zinc-700">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="text-center text-zinc-500 py-12">Loading sessions...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center text-zinc-500 py-12">
          No sessions found. Start chatting with MAUDE to see conversations here.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                      {channelIcons[session.channel] || <Bot className="h-5 w-5 text-zinc-400" />}
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-200 capitalize">
                          {session.channel} Session
                        </span>
                        <Badge className={channelColors[session.channel] || channelColors.system}>
                          {session.channel}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-1">
                        {session.lastMessage || "No messages"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(session.lastMessageAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {session.messageCount} messages
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-300">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
