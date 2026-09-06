import type { InputHTMLAttributes } from "react";
import { leaderQuizConfig } from "../leaderQuizConfig";
import type { LeaderQuizModel } from "../hooks/useLeaderQuiz";

type RegisterScreenProps = {
  quiz: LeaderQuizModel;
};

export function RegisterScreen({ quiz }: RegisterScreenProps) {
  return (
    <section className="screen active" aria-label="報名與介紹">
      {quiz.restored ? (
        <p className="restore-banner">已恢復上次未完成的資料，可直接繼續或重新填寫。</p>
      ) : null}
      <div className="hero-scene">
        <img
          src="/art/campus-hero.jpg"
          alt="淡江校園木廊、陽光與龜龜吉祥物"
          width={1080}
          height={1620}
        />
        <div className="hero-veil" />
        <div className="hero-copy">
          <span className="club-chip">{leaderQuizConfig.clubName}</span>
        </div>
      </div>
      <h1 className="page-title">{leaderQuizConfig.quizTitle}</h1>
      <p className="hero-sub">{leaderQuizConfig.quizSubtitle}</p>

      <div className="prize-card">
        <div className="prize-emoji" aria-hidden="true">
          🎁
        </div>
        <div>
          <strong>{leaderQuizConfig.prizeHint}</strong>
          <span>{leaderQuizConfig.prizeText}</span>
        </div>
      </div>

      <div className="dim-grid" aria-label="四個領導傾向">
        {leaderQuizConfig.dimensions.map((dim) => (
          <article className={`dim-card ${dim.key[0]}`} key={dim.key}>
            <div className="dim-kicker">
              <span className={`dot dot-${dim.key}`} />
              {dim.kicker}
            </div>
            <h2>{dim.label}</h2>
            <p>{dim.blurb}</p>
          </article>
        ))}
      </div>

      <form
        className="card"
        autoComplete="off"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          quiz.start();
        }}
      >
        <Field
          id="name"
          label="姓名"
          required
          value={quiz.form.name}
          error={quiz.fieldErrors.name}
          placeholder="例如：小華"
          maxLength={40}
          onChange={(v) => quiz.setField("name", v)}
        />
        <Field
          id="department"
          label="系級"
          required
          value={quiz.form.department}
          error={quiz.fieldErrors.department}
          placeholder="例如：資工一A"
          maxLength={40}
          onChange={(v) => quiz.setField("department", v)}
        />
        <Field
          id="phone"
          label="台灣手機號碼"
          required
          value={quiz.form.phone}
          error={quiz.fieldErrors.phone}
          placeholder="09xxxxxxxx"
          maxLength={12}
          inputMode="numeric"
          type="tel"
          onChange={(v) => quiz.setField("phone", v)}
        />
        <Field
          id="email"
          label="Email"
          value={quiz.form.email}
          error={quiz.fieldErrors.email}
          placeholder="選填"
          maxLength={80}
          inputMode="email"
          type="email"
          onChange={(v) => quiz.setField("email", v)}
        />
        <button className="cta" type="submit">
          {quiz.restored && quiz.answers.length > 0 ? "繼續上次測驗" : "開始探索"}
        </button>
        <p className="hint">沒有標準答案，選你真的最可能做的事。</p>
      </form>
      <p className="privacy">{leaderQuizConfig.privacyNote}</p>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  value,
  error,
  placeholder,
  maxLength,
  onChange,
  inputMode,
  type = "text",
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  error?: string;
  placeholder: string;
  maxLength: number;
  onChange: (value: string) => void;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  type?: string;
}) {
  return (
    <div className={error ? "field error" : "field"} id={`field-${id}`}>
      <label htmlFor={id}>
        {label} {required ? <span className="req">*</span> : <span className="opt">選填</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={`err-${id}`}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="error-text" id={`err-${id}`}>
        {error}
      </div>
    </div>
  );
}
