"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  FileText,
  Calendar,
  Search,
  RefreshCw,
  Clock,
  ChevronRight,
  FolderOpen
} from "lucide-react";
import { useEffect, useState } from "react";
import { GpuMemoryChart } from "@/components/gpu-memory-chart";

interface MemoryFile {
  name: string;
  path: string;
  size: number;
  modified: number;
}

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/memory");
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Failed to fetch memory files:", error);
    }
    setLoading(false);
  };

  const loadFile = async (path: string) => {
    setSelectedFile(path);
    try {
      const response = await fetch(`/api/memory/file?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      setContent(data.content || "");
    } catch (error) {
      console.error("Failed to load file:", error);
      setContent("Failed to load file");
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const dailyFiles = files.filter(f => f.path.includes("memory/"));
  const mainFiles = files.filter(f => !f.path.includes("memory/"));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Memory</h1>
          <p className="text-zinc-500">Browse agent memory and context files</p>
        </div>
        <Button variant="outline" className="border-zinc-700" onClick={fetchFiles}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search memory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* File Browser */}
        <Card className="border-zinc-800 bg-zinc-900/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <FolderOpen className="h-5 w-5 text-cyan-400" />
              Files
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-zinc-800 bg-transparent px-4">
                <TabsTrigger value="main" className="data-[state=active]:bg-zinc-800">
                  Main
                </TabsTrigger>
                <TabsTrigger value="daily" className="data-[state=active]:bg-zinc-800">
                  Daily
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="main" className="m-0">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-zinc-800">
                    {mainFiles.map((file) => (
                      <div
                        key={file.path}
                        className={`p-3 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                          selectedFile === file.path ? "bg-zinc-800/50" : ""
                        }`}
                        onClick={() => loadFile(file.path)}
                      >
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-400" />
                          <span className="text-sm text-zinc-200">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                          <span>{formatSize(file.size)}</span>
                          <span>•</span>
                          <span>{formatDate(file.modified)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="daily" className="m-0">
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-zinc-800">
                    {dailyFiles.map((file) => (
                      <div
                        key={file.path}
                        className={`p-3 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                          selectedFile === file.path ? "bg-zinc-800/50" : ""
                        }`}
                        onClick={() => loadFile(file.path)}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-zinc-200">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                          <span>{formatSize(file.size)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Content Viewer */}
        <Card className="border-zinc-800 bg-zinc-900/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <FileText className="h-5 w-5 text-cyan-400" />
              {selectedFile || "Select a file"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              {content ? (
                <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {content}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  Select a file to view its contents
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      {/* GPU Memory */}
      <GpuMemoryChart />
    </div>
  );
}
