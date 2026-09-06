import { createFileRoute } from "@tanstack/react-router";
import { staffStats } from "@/server/quiz/staff";
import { assertStaff } from "@/server/quiz/staff-auth";
import { clientIp, rateLimit, STAFF_LIMIT } from "@/server/quiz/rate-limit";

export const Route = createFileRoute("/api/staff/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = rateLimit(`staff:${clientIp(request)}`, STAFF_LIMIT);
        if (!limited.ok) return Response.json({ ok: false, error: "請稍後再試" }, { status: 429 });
        const auth = assertStaff(request);
        if (!auth.ok) return Response.json({ ok: false, error: auth.error }, { status: auth.status });
        const stats = await staffStats();
        return Response.json({ ok: true, stats });
      },
    },
  },
});
