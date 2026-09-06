type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  now = Date.now(),
): { ok: true } | { ok: false; retryAfterSec: number } {
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (current.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { ok: true };
}

export function resetRateLimitForTests(): void {
  buckets.clear();
}

export const SUBMIT_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 };
export const STAFF_LIMIT = { limit: 30, windowMs: 10 * 60 * 1000 };
export const DRAW_LIMIT = { limit: 6, windowMs: 60 * 60 * 1000 };
export const MAX_BODY_BYTES = 16 * 1024;
