import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function getGpuStats() {
  try {
    const { stdout } = await execAsync(
      "nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw --format=csv,noheader,nounits"
    );
    const [name, temp, util, memUsed, memTotal, power] = stdout.trim().split(", ");
    return {
      name: name || "NVIDIA GB10",
      temperature: parseInt(temp) || 0,
      utilization: parseInt(util) || 0,
      memoryUsed: Math.round(parseInt(memUsed) / 1024) || 0, // Convert MB to GB
      memoryTotal: Math.round(parseInt(memTotal) / 1024) || 128,
      power: Math.round(parseFloat(power)) || 0,
    };
  } catch (error) {
    console.error("Failed to get GPU stats:", error);
    return {
      name: "NVIDIA GB10",
      temperature: 0,
      utilization: 0,
      memoryUsed: 0,
      memoryTotal: 128,
      power: 0,
    };
  }
}

async function getMemoryStats() {
  try {
    const { stdout } = await execAsync("free -g | grep Mem");
    const parts = stdout.trim().split(/\s+/);
    return {
      total: parseInt(parts[1]) || 119,
      used: parseInt(parts[2]) || 0,
    };
  } catch (error) {
    console.error("Failed to get memory stats:", error);
    return { total: 119, used: 0 };
  }
}

export async function GET() {
  const [gpu, memory] = await Promise.all([getGpuStats(), getMemoryStats()]);

  return NextResponse.json({
    gpu,
    memory,
    timestamp: Date.now(),
  });
}
