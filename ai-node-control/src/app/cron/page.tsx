"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, 
  Play,
  Pause,
  MoreVertical,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useEffect, useState } from "react";

interface CronJob {
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

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/cron");
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch cron jobs:", error);
    }
    setLoading(false);
  };

  const formatTime = (ms?: number) => {
    if (!ms) return "—";
    return new Date(ms).toLocaleString();
  };

  const formatSchedule = (schedule: CronJob["schedule"]) => {
    if (schedule.expr) return schedule.expr;
    return schedule.kind;
  };

  const runJob = async (jobId: string) => {
    try {
      await fetch(`/api/cron/${jobId}/run`, { method: "POST" });
      fetchJobs();
    } catch (error) {
      console.error("Failed to run job:", error);
    }
  };

  const toggleJob = async (jobId: string, enabled: boolean) => {
    try {
      await fetch(`/api/cron/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      fetchJobs();
    } catch (error) {
      console.error("Failed to toggle job:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cron Jobs</h1>
          <p className="text-zinc-500">Scheduled tasks and automations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-700" onClick={fetchJobs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Clock className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Status indicator */}
                    <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-lg ${
                      job.enabled ? "bg-cyan-500/10" : "bg-zinc-800"
                    }`}>
                      <Clock className={`h-5 w-5 ${job.enabled ? "text-cyan-400" : "text-zinc-500"}`} />
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-200">{job.name}</span>
                        <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-zinc-400">
                          {formatSchedule(job.schedule)}
                        </Badge>
                        {job.state?.lastStatus && (
                          <Badge className={
                            job.state.lastStatus === "ok" 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }>
                            {job.state.lastStatus === "ok" ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {job.state.lastStatus}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-2 max-w-xl">
                        {job.payload.text.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {formatTime(job.state?.nextRunAtMs)}
                        </span>
                        {job.state?.lastRunAtMs && (
                          <span>Last: {formatTime(job.state.lastRunAtMs)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={job.enabled}
                      onCheckedChange={(checked) => toggleJob(job.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700"
                      onClick={() => runJob(job.id)}
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Run Now
                    </Button>
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-300">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
