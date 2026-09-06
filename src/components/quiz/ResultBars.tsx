import { DIMENSIONS, type Dimension, type Scores } from "@/features/leader-quiz/types";
import { dimensionLabel } from "@/features/leader-quiz/lib/result";
import { normalizeScores } from "@/features/leader-quiz/lib/scoring";

type ResultBarsProps = {
  scores: Scores;
  winner: Dimension;
};

const FILL: Record<Dimension, string> = {
  vision: "fill-vision",
  empathy: "fill-empathy",
  decision: "fill-decision",
  crisis: "fill-crisis",
};

export function ResultBars({ scores, winner }: ResultBarsProps) {
  const normalized = normalizeScores(scores);
  return (
    <div className="bars-card">
      <p className="section-label">本次選擇傾向</p>
      {DIMENSIONS.map((dim) => {
        const pct = Math.round(normalized[dim] * 100);
        return (
          <div className="score-row" key={dim}>
            <div className="score-head">
              <span className="score-name">{dimensionLabel(dim)}</span>
              {dim === winner ? <span className="main-badge">你的主要特質</span> : null}
              <span className="score-val">{scores[dim]} 分</span>
            </div>
            <div
              className="bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label={`${dimensionLabel(dim)} ${scores[dim]} 分`}
            >
              <i className={FILL[dim]} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
