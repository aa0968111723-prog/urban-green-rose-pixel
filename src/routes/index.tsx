import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/leader-quiz.html" });
  },
  component: Home,
});

function Home() {
  return (
    <main className="quiz-shell">
      <p>正在進入測驗…</p>
    </main>
  );
}
