import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import type { LeaderQuizModel } from "../hooks/useLeaderQuiz";

type QuizScreenProps = {
  quiz: LeaderQuizModel;
};

export function QuizScreen({ quiz }: QuizScreenProps) {
  return (
    <section className="screen active" aria-label="情境測驗">
      {quiz.restored ? <p className="restore-banner">已恢復上次進度，可繼續作答或返回修改。</p> : null}
      <div className="scene-strip" aria-hidden="true">
        <img src="/art/campus-banner.jpg" alt="" />
      </div>
      <QuizProgress current={quiz.currentIndex + 1} total={quiz.total} />
      <QuizQuestion
        question={quiz.question}
        selectedKey={quiz.selectedKey}
        disabled={quiz.isAdvancing}
        onSelect={quiz.select}
      />
      {quiz.currentIndex > 0 ? (
        <button className="back-btn" type="button" onClick={quiz.back} disabled={quiz.isAdvancing}>
          上一題
        </button>
      ) : null}
    </section>
  );
}
