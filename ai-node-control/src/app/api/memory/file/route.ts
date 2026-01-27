import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const WORKSPACE = process.env.WORKSPACE || "/home/mboard76/clawd";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path required" }, { status: 400 });
  }

  // Security: prevent path traversal
  if (path.includes("..") || path.startsWith("/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const fullPath = join(WORKSPACE, path);
    const content = await readFile(fullPath, "utf-8");
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Failed to read file:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
