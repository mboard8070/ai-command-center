"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Timer,
  Hash,
  Zap,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

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
  scheduleHuman: string;
  cronResolved: string;
  timeUntilNextRun: string;
}

interface Stats {
  total: number;
  active: number;
  totalRuns: number;
}

export default function SchedulerPage() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, totalRuns: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const fetchTasks = useCallback(async () => {
    try {
      const { authFetch } = await import("@/lib/auth");
      const response = await authFetch("/api/scheduler");
      const data = await response.json();
      setTasks(data.tasks || []);
      setStats(data.stats || { total: 0, active: 0, totalRuns: 0 });
    } catch (error) {
      console.error("Failed to fetch scheduled tasks:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.cron.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scheduler</h1>
          <p className="text-zinc-500">Manage scheduled MAUDE tasks</p>
        </div>
        <Button variant="outline" className="border-zinc-700" onClick={fetchTasks}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Active</p>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Hash className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Runs</p>
              <p className="text-2xl font-bold text-white">{stats.totalRuns}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>

      {/* Task List */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-base">
            <Clock className="h-5 w-5 text-cyan-400" />
            Scheduled Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Clock className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No scheduled tasks</p>
              <p className="text-sm mt-1">
                Ask MAUDE to schedule a task, e.g., &quot;remind me every morning to check the weather&quot;
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="divide-y divide-zinc-800">
                {filteredTasks.map((task) => {
                  const isExpanded = expandedTasks.has(task.id);
                  return (
                    <div key={task.id} className="transition-colors hover:bg-zinc-800/30">
                      {/* Task Header */}
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer"
                        onClick={() => toggleExpanded(task.id)}
                      >
                        <button className="text-zinc-500 hover:text-zinc-300">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-200 font-medium truncate">
                              {task.name}
                            </span>
                            {task.enabled ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-zinc-600 bg-zinc-800 text-zinc-400"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Disabled
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.scheduleHuman}
                            </span>
                            {task.enabled && task.next_run && (
                              <span className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                Next: {task.timeUntilNextRun}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right text-sm text-zinc-500">
                          <div>Runs: {task.run_count}</div>
                          <div className="text-xs">ID: {task.id}</div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pl-14 space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                                Prompt
                              </div>
                              <div className="text-sm text-zinc-300 bg-zinc-800/50 rounded p-2">
                                {task.prompt}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                                  Cron Expression
                                </div>
                                <div className="text-sm text-zinc-400 font-mono">
                                  {task.cronResolved}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                                  Channel
                                </div>
                                <div className="text-sm text-zinc-400">
                                  {task.channel} ({task.channel_id})
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                                Last Run
                              </div>
                              <div className="text-sm text-zinc-400">
                                {formatDate(task.last_run)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                                Next Run
                              </div>
                              <div className="text-sm text-zinc-400">
                                {formatDate(task.next_run)}
                              </div>
                            </div>
                          </div>

                          {task.last_result && (
                            <div>
                              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                                Last Result
                              </div>
                              <div className="text-sm text-zinc-400 bg-zinc-800/50 rounded p-2 max-h-24 overflow-y-auto">
                                {task.last_result}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2 text-xs text-zinc-600">
                            <span>
                              Manage via MAUDE: &quot;disable {task.name}&quot; or &quot;remove {task.id}&quot;
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardContent className="p-4">
          <div className="text-sm text-zinc-500">
            <p className="font-medium text-zinc-400 mb-2">Create tasks by talking to MAUDE:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>&quot;Remind me every morning at 8am to check the weather&quot;</li>
              <li>&quot;Schedule a daily summary of my tasks at 6pm&quot;</li>
              <li>&quot;Every weekday at 9am, check my calendar&quot;</li>
              <li>&quot;Show my scheduled tasks&quot; or &quot;Disable the weather reminder&quot;</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
