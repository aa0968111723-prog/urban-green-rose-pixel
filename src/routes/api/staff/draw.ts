import { createFileRoute } from "@tanstack/react-router";
import { drawLottery } from "@/server/quiz/draw";
import { assertStaff } from "@/server/quiz/staff-auth";
import { clientIp, DRAW_LIMIT, rateLimit } from "@/server/quiz/rate-limit";

export const Route = createFileRoute("/api/staff/draw")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = rateLimit(`draw:${clientIp(request)}`, DRAW_LIMIT);
        if (!limited.ok) return Response.json({ ok: false, error: "抽獎次數暫時達上限" }, { status: 429 });
        const auth = assertStaff(request);
        if (!auth.ok) return Response.json({ ok: false, error: auth.error }, { status: auth.status });
        let count = 5;
        try {
          const body = (await request.json()) as { count?: number };
          if (Number.isInteger(body.count) && body.count! > 0 && body.count! <= 20) {
            count = body.count!;
          }
        } catch {
          count = 5;
        }
        const result = await drawLottery(count);
        if (!result.ok) return Response.json(result, { status: result.status });
        return Response.json(result);
      },
    },
  },
});
