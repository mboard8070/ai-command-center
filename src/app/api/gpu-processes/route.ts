import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const processColors = [
  "#8b5cf6", // purple - LLMs
  "#06b6d4", // cyan - Python/ML
  "#f97316", // orange
  "#ec4899", // pink
  "#22c55e", // green
  "#eab308", // yellow
  "#ef4444", // red
  "#3b82f6", // blue
];

export async function GET() {
  try {
    // Get GPU processes from nvidia-smi
    const { stdout } = await execAsync(
      'nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv,noheader,nounits 2>/dev/null || echo ""'
    );
    
    // Parse processes
    const processes = stdout
      .trim()
      .split("\n")
      .filter(line => line.trim())
      .map((line, index) => {
        const [pid, name, memory] = line.split(", ").map(s => s.trim());
        return {
          pid: parseInt(pid, 10),
          name: name || "Unknown",
          memory: parseInt(memory, 10) || 0, // in MB
          type: name?.includes("python") ? "Compute" : name?.includes("llama") ? "LLM Server" : "Compute",
          color: processColors[index % processColors.length],
        };
      })
      .sort((a, b) => b.memory - a.memory); // Sort by memory descending
    
    // DGX Spark has 128GB unified memory
    // For GPU allocation purposes, we track what's actively used
    const totalGpuMemory = 128 * 1024; // 128 GB in MB
    const usedMemory = processes.reduce((acc, p) => acc + p.memory, 0);
    const freeMemory = totalGpuMemory - usedMemory;
    
    return NextResponse.json({
      total: totalGpuMemory,
      used: usedMemory,
      free: freeMemory,
      processes,
    });
  } catch (error) {
    console.error("Error fetching GPU data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GPU data" },
      { status: 500 }
    );
  }
}
