import { ResultBars } from "@/components/quiz/ResultBars";
import { ResultRadar } from "@/components/quiz/ResultRadar";
import { ResultShareCard } from "@/components/quiz/ResultShareCard";
import { BADGE_SVG } from "../data/badges";
import { getPrototype } from "../lib/result";
import { leaderQuizConfig } from "../leaderQuizConfig";
import type { LeaderQuizModel } from "../hooks/useLeaderQuiz";
import { RecruitCta } from "./RecruitCta";

type ResultScreenProps = {
  quiz: LeaderQuizModel;
};

export function ResultScreen({ quiz }: ResultScreenProps) {
  const proto = getPrototype(quiz.winner);
  const statusClass =
    quiz.submitStatus === "success"
      ? "submit-status ok"
      : quiz.submitStatus === "duplicate"
        ? "submit-status ok"
        : quiz.submitStatus === "error"
          ? "submit-status warn"
          : "submit-status";

  return (
    <section className="screen active" aria-label="測驗結果">
      <div className="scene-strip" aria-hidden="true">
        <img src="/art/campus-banner.jpg" alt="" />
      </div>

      <p className="result-kicker">你的領袖原型</p>
      <div className="badge-wrap">
        <div
          className="proto-badge"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: BADGE_SVG[proto.key] }}
        />
      </div>
      <h2 className="result-title">{proto.title}</h2>
      <p className="result-tagline">{proto.tagline}</p>
      <p className="disclaimer">{leaderQuizConfig.disclaimer}</p>

      <ResultRadar scores={quiz.scores} />
      <ResultBars scores={quiz.scores} winner={quiz.winner} />

      <div className="story-card">
        <p className="section-label">你在團隊中的優勢</p>
        <ul>
          {proto.strengths.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="story-card">
        <p className="section-label">可以練習的方向</p>
        <ul>
          {proto.practices.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="story-card">
        <p className="section-label">你可能適合的社團角色</p>
        <p className="roles">{proto.clubRoles.join(" · ")}</p>
      </div>

      <div className="story-card">
        <p>
          <strong>領導沒有唯一的樣子。</strong>
        </p>
        <p>
          有人擅長看方向，有人能讓團隊靠得更近，有人讓事情真正開始，也有人在變化裡找到新的路。
        </p>
        <p>
          真正的領導力，不是變成某一種標準答案，而是更了解自己，也學習怎麼和不同特質的人一起完成事情。
        </p>
      </div>

      <ResultShareCard
        name={quiz.registration?.name ?? ""}
        prototype={proto}
        scores={quiz.scores}
        winner={quiz.winner}
      />

      <RecruitCta />

      <div className="done-card">
        {quiz.submitStatus === "success" ? (
          <p className="cta-static">已成功登記抽獎</p>
        ) : quiz.submitStatus === "duplicate" ? (
          <p className="cta-static">你已經完成抽獎登記，這次結果仍可查看與分享。</p>
        ) : quiz.submitStatus === "pending" ? (
          <p className="hint">正在登記抽獎…</p>
        ) : (
          <p className="hint">完成測驗後可登記抽獎</p>
        )}
        <p className="hint">{leaderQuizConfig.prizeText}</p>
        {quiz.submitStatus === "error" ? (
          <p className={statusClass} aria-live="polite">
            {quiz.submitMessage}
          </p>
        ) : (
          <p className={statusClass} aria-live="polite" />
        )}
        {quiz.submitStatus === "error" ? (
          <button className="cta" type="button" onClick={quiz.retrySubmit}>
            重新送出登記
          </button>
        ) : null}
        <button className="cta secondary" type="button" onClick={quiz.reset}>
          重新測驗
        </button>
      </div>
    </section>
  );
}
