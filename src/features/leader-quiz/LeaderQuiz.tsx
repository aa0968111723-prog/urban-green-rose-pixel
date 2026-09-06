import { QuizAtmosphere } from "./components/QuizAtmosphere";
import { QuizScreen } from "./components/QuizScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { ResultScreen } from "./components/ResultScreen";
import { useLeaderQuiz } from "./hooks/useLeaderQuiz";

export function LeaderQuiz() {
  const quiz = useLeaderQuiz();
  return (
    <div className="leader-quiz">
      <QuizAtmosphere />
      <div className="app">
        {quiz.screen === "register" ? <RegisterScreen quiz={quiz} /> : null}
        {quiz.screen === "quiz" ? <QuizScreen quiz={quiz} /> : null}
        {quiz.screen === "result" ? <ResultScreen quiz={quiz} /> : null}
      </div>
    </div>
  );
}
