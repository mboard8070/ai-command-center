import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// API token from environment
const API_TOKEN = process.env.AI_COMMAND_CENTER_TOKEN;

// Allowed origins (Tailscale IPs + localhost)
const ALLOWED_ORIGINS = [
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://100.107.132.16:3001", // DGX Spark
  "http://100.104.211.90:3001", // Mattwell
  "http://100.90.191.88:3001",  // MacBook
];

// Paths that require authentication
const PROTECTED_PATHS = ["/api/"];

// Paths that are public (no auth needed)
const PUBLIC_PATHS = ["/", "/_next/", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // CORS handling
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, {
      status: 403,
      statusText: "Forbidden - Origin not allowed",
    });
  }

  // Check if path requires auth
  const isProtectedPath = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isProtectedPath && API_TOKEN) {
    // Check for API token in header or query
    const authHeader = request.headers.get("x-api-key");
    const queryToken = request.nextUrl.searchParams.get("token");

    if (authHeader !== API_TOKEN && queryToken !== API_TOKEN) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing API key" },
        { status: 401 }
      );
    }
  }

  // Add security headers
  const response = NextResponse.next();

  // CORS headers
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
  }

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
