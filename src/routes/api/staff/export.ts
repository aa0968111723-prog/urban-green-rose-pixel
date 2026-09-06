import { createFileRoute } from "@tanstack/react-router";
import { exportWinnersCsv } from "@/server/quiz/draw";
import { assertStaff } from "@/server/quiz/staff-auth";
import { clientIp, rateLimit, STAFF_LIMIT } from "@/server/quiz/rate-limit";

export const Route = createFileRoute("/api/staff/export")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = rateLimit(`staff-export:${clientIp(request)}`, STAFF_LIMIT);
        if (!limited.ok) return Response.json({ ok: false, error: "請稍後再試" }, { status: 429 });
        const auth = assertStaff(request);
        if (!auth.ok) return Response.json({ ok: false, error: auth.error }, { status: auth.status });
        const csv = await exportWinnersCsv();
        return new Response(csv, {
          headers: {
            "content-type": "text/csv; charset=utf-8",
            "content-disposition": 'attachment; filename="lottery-winners.csv"',
          },
        });
      },
    },
  },
});
