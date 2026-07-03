type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

function getKey(req: Request, namespace: string) {
  const forwarded = req.headers.get("x-forwarded-for");
  const host = req.headers.get("x-real-ip") || forwarded?.split(",")[0].trim() || "unknown";
  try {
    const cookie = req.headers.get("cookie") || "";
    const m = cookie.match(/skyvora_token=[^;]+/);
    return `${namespace}:${m ? `u:${m[0]}` : host}`;
  } catch {
    return `${namespace}:${host}`;
  }
}

export function isRateLimited(req: Request, namespace: string, max: number, windowMs: number) {
  const now = Date.now();
  const key = getKey(req, namespace);
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > max) return true;
  return false;
}

export async function requireRateLimit(req: Request, namespace: string, max: number, windowMs: number) {
  try {
    if (isRateLimited(req, namespace, max, windowMs)) {
      return new Response(JSON.stringify({ error: "Terlalu banyak permintaan, coba lagi sebentar" }), {
        status: 429,
        headers: { "content-type": "application/json", "retry-after": "10" },
      });
    }
  } catch {
    // don't block on limiter failure
  }
  return null;
}
