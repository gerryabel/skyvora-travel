import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/app/lib/auth";

export async function requireAdmin(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth.success) return auth;
  if (auth.payload.role !== "ADMIN") {
    return { success: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return auth;
}
