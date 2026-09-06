export const DIMENSIONS = ["vision", "empathy", "decision", "crisis"] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export const OPTION_KEYS = ["A", "B", "C", "D"] as const;
export type OptionKey = (typeof OPTION_KEYS)[number];

export type Scores = Record<Dimension, number>;

export type QuestionOption = {
  key: OptionKey;
  text: string;
  scores: Scores;
};

export type Question = {
  id: number;
  category: string;
  question: string;
  options: readonly [QuestionOption, QuestionOption, QuestionOption, QuestionOption];
};

export type Answer = {
  questionId: number;
  choice: OptionKey;
};

export type Registration = {
  name: string;
  department: string;
  phone: string;
  email: string;
};

export type Tracking = {
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

export type Prototype = {
  key: Dimension;
  title: string;
  tagline: string;
  body: readonly string[];
  strengths: readonly string[];
  practices: readonly string[];
  clubRoles: readonly string[];
};

export type QuizScreen = "register" | "quiz" | "result";

export type SubmitStatus = "idle" | "pending" | "success" | "duplicate" | "error";

export type SubmitResponse = {
  ok: boolean;
  submissionId?: string;
  winner?: Dimension;
  scores?: Scores;
  alreadyRegistered?: boolean;
  error?: string;
};
