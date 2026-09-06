export function readStaffToken(request: Request): string {
  const header = request.headers.get("x-staff-token")?.trim();
  if (header) return header;
  const auth = request.headers.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return new URL(request.url).searchParams.get("token")?.trim() ?? "";
}

export function expectedStaffToken(): string | null {
  const env = process.env.STAFF_TOKEN?.trim();
  if (env) return env;
  if (process.env.NODE_ENV !== "production") return "preview";
  return null;
}

export function assertStaff(request: Request): { ok: true } | { ok: false; status: number; error: string } {
  const expected = expectedStaffToken();
  if (!expected) {
    return { ok: false, status: 503, error: "後台尚未設定 STAFF_TOKEN" };
  }
  if (readStaffToken(request) !== expected) {
    return { ok: false, status: 401, error: "staff token 不正確" };
  }
  return { ok: true };
}
