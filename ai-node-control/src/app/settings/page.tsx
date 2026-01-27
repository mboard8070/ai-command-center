"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Key,
  Server,
  Bell,
  Palette,
  Shield,
  RefreshCw,
  Save,
  ExternalLink
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [gatewayUrl, setGatewayUrl] = useState("http://localhost:18789");
  const [apiToken, setApiToken] = useState("••••••••••••••••");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleSave = () => {
    // Save settings to localStorage or API
    console.log("Saving settings...");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-500">Configure AI Command Center preferences</p>
      </div>

      {/* Connection Settings */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Server className="h-5 w-5 text-cyan-400" />
            Connection
          </CardTitle>
          <CardDescription>Gateway connection settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Gateway URL</label>
            <Input
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">API Token</label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
              <Button variant="outline" className="border-zinc-700">
                <Key className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm text-zinc-200">Connection Status</p>
              <p className="text-xs text-zinc-500">Last checked: just now</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Palette className="h-5 w-5 text-purple-400" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200">Auto Refresh</p>
              <p className="text-xs text-zinc-500">Automatically refresh data every 10 seconds</p>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200">Notifications</p>
              <p className="text-xs text-zinc-500">Show desktop notifications for events</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200">Dark Mode</p>
              <p className="text-xs text-zinc-500">Use dark theme (always on)</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} disabled />
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-blue-400" />
            About
          </CardTitle>
          <CardDescription>System information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Version</span>
            <span className="text-sm text-zinc-200">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Agent</span>
            <span className="text-sm text-zinc-200">Agent (main)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Gateway</span>
            <span className="text-sm text-zinc-200">Clawdbot v0.4.x</span>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="border-zinc-700 flex-1" asChild>
              <a href="https://docs.clawd.bot" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Documentation
              </a>
            </Button>
            <Button variant="outline" className="border-zinc-700 flex-1" asChild>
              <a href="https://github.com/clawdbot/clawdbot" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
