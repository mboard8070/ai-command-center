"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Shield,
  Key,
  Lock,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Clock,
  Users,
  FileWarning,
} from "lucide-react";
import { useState } from "react";

export default function SecurityPage() {
  const [showToken, setShowToken] = useState(false);
  const [apiToken, setApiToken] = useState("72ffc5432d7a395c1da7d72831c173d9b59cb6b5875eca7d");
  const [corsEnabled, setCorsEnabled] = useState(true);
  const [rateLimiting, setRateLimiting] = useState(true);
  const [httpsOnly, setHttpsOnly] = useState(false);
  const [allowInsecureAuth, setAllowInsecureAuth] = useState(true);

  const securityChecks = [
    { name: "API Token Authentication", status: "pass", description: "Token-based auth enabled" },
    { name: "CORS Protection", status: "pass", description: "Cross-origin requests restricted" },
    { name: "Security Headers", status: "pass", description: "X-Frame-Options, CSP enabled" },
    { name: "Rate Limiting", status: "pass", description: "100 requests/minute per IP" },
    { name: "HTTPS Only", status: "warn", description: "HTTP allowed (development)" },
    { name: "Credentials Directory", status: "fail", description: "Writable by others (chmod 700)" },
  ];

  const copyToken = () => {
    navigator.clipboard.writeText(apiToken);
  };

  const regenerateToken = () => {
    // Generate new token
    const newToken = Array.from({ length: 48 }, () => 
      "0123456789abcdef"[Math.floor(Math.random() * 16)]
    ).join("");
    setApiToken(newToken);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Security</h1>
        <p className="text-zinc-500">Manage authentication, access control, and security settings</p>
      </div>

      {/* Security Status Overview */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-cyan-400" />
            Security Status
          </CardTitle>
          <CardDescription>Current security posture of your ACE installation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {securityChecks.map((check, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  {check.status === "pass" ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : check.status === "warn" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{check.name}</p>
                    <p className="text-xs text-zinc-500">{check.description}</p>
                  </div>
                </div>
                <Badge 
                  className={
                    check.status === "pass" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : check.status === "warn"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }
                >
                  {check.status === "pass" ? "Secure" : check.status === "warn" ? "Warning" : "Action Required"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Authentication */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Key className="h-5 w-5 text-amber-400" />
            API Authentication
          </CardTitle>
          <CardDescription>Manage API tokens and authentication methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Gateway API Token</label>
            <div className="flex gap-2">
              <Input
                type={showToken ? "text" : "password"}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm"
              />
              <Button 
                variant="outline" 
                className="border-zinc-700"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                className="border-zinc-700"
                onClick={copyToken}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-zinc-700"
              onClick={regenerateToken}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Token
            </Button>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200">Allow Insecure Auth</p>
              <p className="text-xs text-zinc-500">Allow token auth over HTTP (not recommended for production)</p>
            </div>
            <Switch checked={allowInsecureAuth} onCheckedChange={setAllowInsecureAuth} />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lock className="h-5 w-5 text-purple-400" />
            Access Control
          </CardTitle>
          <CardDescription>Configure CORS, rate limiting, and access policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200">CORS Protection</p>
              <p className="text-xs text-zinc-500">Restrict cross-origin requests to allowed domains</p>
            </div>
            <Switch checked={corsEnabled} onCheckedChange={setCorsEnabled} />
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200">Rate Limiting</p>
              <p className="text-xs text-zinc-500">Limit API requests to prevent abuse (100/min per IP)</p>
            </div>
            <Switch checked={rateLimiting} onCheckedChange={setRateLimiting} />
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200">HTTPS Only</p>
              <p className="text-xs text-zinc-500">Reject non-HTTPS connections (requires SSL setup)</p>
            </div>
            <Switch checked={httpsOnly} onCheckedChange={setHttpsOnly} />
          </div>
        </CardContent>
      </Card>

      {/* Allowed Origins */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Globe className="h-5 w-5 text-blue-400" />
            Allowed Origins
          </CardTitle>
          <CardDescription>Domains permitted to make API requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {["http://localhost:3000", "http://100.107.132.16:18789", "https://ace.local"].map((origin, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/50">
              <span className="text-sm text-zinc-200 font-mono">{origin}</span>
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400">
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Input 
              placeholder="https://example.com" 
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
            <Button variant="outline" className="border-zinc-700">
              Add Origin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileWarning className="h-5 w-5 text-orange-400" />
            Recent Security Events
          </CardTitle>
          <CardDescription>Authentication attempts and security alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "2 min ago", event: "Successful authentication", ip: "100.90.191.88", status: "success" },
              { time: "15 min ago", event: "Rate limit triggered", ip: "192.168.1.105", status: "warn" },
              { time: "1 hour ago", event: "Invalid token attempt", ip: "unknown", status: "fail" },
              { time: "3 hours ago", event: "Gateway restart", ip: "localhost", status: "info" },
            ].map((event, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    event.status === "success" ? "bg-emerald-500" :
                    event.status === "warn" ? "bg-amber-500" :
                    event.status === "fail" ? "bg-red-500" : "bg-blue-500"
                  }`} />
                  <div>
                    <p className="text-sm text-zinc-200">{event.event}</p>
                    <p className="text-xs text-zinc-500">IP: {event.ip}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-500">{event.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
