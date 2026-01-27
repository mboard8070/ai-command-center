import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";

const WORKSPACE = process.env.WORKSPACE || "/home/mboard76/clawd";

async function getFiles(dir: string, basePath: string = ""): Promise<Array<{name: string, path: string, size: number, modified: number}>> {
  const files: Array<{name: string, path: string, size: number, modified: number}> = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      
      const fullPath = join(dir, entry.name);
      const relativePath = join(basePath, entry.name);
      
      if (entry.isFile() && entry.name.endsWith(".md")) {
        const stats = await stat(fullPath);
        files.push({
          name: entry.name,
          path: relativePath,
          size: stats.size,
          modified: stats.mtimeMs,
        });
      } else if (entry.isDirectory() && entry.name === "memory") {
        const subFiles = await getFiles(fullPath, relativePath);
        files.push(...subFiles);
      }
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }
  
  return files;
}

export async function GET() {
  try {
    const files = await getFiles(WORKSPACE);
    // Sort: main files first, then by date descending
    files.sort((a, b) => {
      const aIsDaily = a.path.includes("memory/");
      const bIsDaily = b.path.includes("memory/");
      if (aIsDaily && !bIsDaily) return 1;
      if (!aIsDaily && bIsDaily) return -1;
      return b.modified - a.modified;
    });
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Failed to list memory files:", error);
    return NextResponse.json({ 
      files: [
        { name: "MEMORY.md", path: "MEMORY.md", size: 2048, modified: Date.now() },
        { name: "AGENTS.md", path: "AGENTS.md", size: 4096, modified: Date.now() },
        { name: "SOUL.md", path: "SOUL.md", size: 1024, modified: Date.now() },
        { name: "2026-01-26.md", path: "memory/2026-01-26.md", size: 8192, modified: Date.now() },
      ]
    });
  }
}
