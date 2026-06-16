// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./app/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("skyvora_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(token);

    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
