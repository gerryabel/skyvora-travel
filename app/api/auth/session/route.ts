// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("skyvora_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    },
  });
}
