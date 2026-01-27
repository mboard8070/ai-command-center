"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Search,
  Filter,
  MoreVertical,
  Clock,
  User,
  Bot
} from "lucide-react";
import { useState } from "react";

// Placeholder sessions - will connect to real API
const sessions = [
  {
    id: "telegram:7941965932",
    platform: "telegram",
    user: "Matthew Board",
    lastMessage: "ok, so the clawd web dashboard isn't great...",
    lastActive: "2 min ago",
    messageCount: 45,
    status: "active",
  },
  {
    id: "main",
    platform: "system",
    user: "Main Session",
    lastMessage: "Heartbeat check",
    lastActive: "5 min ago",
    messageCount: 120,
    status: "idle",
  },
];

const platformColors: Record<string, string> = {
  telegram: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  discord: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  whatsapp: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  slack: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  system: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sessions</h1>
          <p className="text-zinc-500">Active conversations across all platforms</p>
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
      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id} className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                    {session.platform === "system" ? (
                      <Bot className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <User className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-200">{session.user}</span>
                      <Badge className={platformColors[session.platform]}>
                        {session.platform}
                      </Badge>
                      {session.status === "active" && (
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-1">{session.lastMessage}</p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.lastActive}
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
    </div>
  );
}
