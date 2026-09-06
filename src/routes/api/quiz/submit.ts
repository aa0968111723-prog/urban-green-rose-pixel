import { createFileRoute } from "@tanstack/react-router";
import { handleQuizSubmit } from "@/server/quiz/submit";

export const Route = createFileRoute("/api/quiz/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const result = await handleQuizSubmit(request);
        return Response.json(result.body, { status: result.status });
      },
    },
  },
});
