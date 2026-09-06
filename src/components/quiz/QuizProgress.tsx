type QuizProgressProps = {
  current: number;
  total: number;
};

export function QuizProgress({ current, total }: QuizProgressProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <>
      <div className="quiz-top">
        <div className="q-count">
          {current} / {total}
        </div>
        <div className="q-pct">{pct}%</div>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`進度 ${current} / ${total}`}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </>
  );
}
