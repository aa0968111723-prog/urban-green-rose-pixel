import { createFileRoute } from "@tanstack/react-router";
import { LeaderQuiz } from "@/features/leader-quiz/LeaderQuiz";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <LeaderQuiz />;
}
