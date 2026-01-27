"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getToken, setToken, clearToken, authFetch } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function LoginForm({ onLogin }: { onLogin: (token: string) => Promise<boolean> }) {
  const [token, setTokenInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await onLogin(token);
    if (!success) {
      setError("Invalid API token");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
            <Shield className="h-6 w-6 text-cyan-400" />
          </div>
          <CardTitle className="text-xl text-white">AI Command Center</CardTitle>
          <CardDescription>Enter your API token to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="API Token"
                value={token}
                onChange={(e) => setTokenInput(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              disabled={loading || !token}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Authenticate"
              )}
            </Button>
          </form>
          <p className="mt-4 text-xs text-zinc-500 text-center">
            Token is stored locally in your browser
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a valid token on mount
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        // Verify token by making a test request
        try {
          const response = await authFetch("/api/system");
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            clearToken();
          }
        } catch {
          // If server is down, assume token is valid
          setIsAuthenticated(true);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (token: string): Promise<boolean> => {
    // Test the token
    setToken(token);
    try {
      const response = await authFetch("/api/system");
      if (response.ok) {
        setIsAuthenticated(true);
        return true;
      }
    } catch {
      // Network error - accept token anyway for offline use
      setIsAuthenticated(true);
      return true;
    }
    clearToken();
    return false;
  };

  const logout = () => {
    clearToken();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
