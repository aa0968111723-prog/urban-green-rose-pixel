import { createFileRoute } from "@tanstack/react-router";
import { LeaderQuiz } from "@/features/leader-quiz/LeaderQuiz";

export const Route = createFileRoute("/quiz")({
  component: QuizPage,
});

function QuizPage() {
  return <LeaderQuiz />;
}
