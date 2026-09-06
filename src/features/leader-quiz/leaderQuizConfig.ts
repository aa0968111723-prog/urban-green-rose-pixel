import { clubConfig } from "../../config/clubConfig.ts";
import { QUESTIONS } from "./data/questions.ts";
import { calculateScores, calculateWinner } from "./lib/scoring.ts";
import type { GameDefinition } from "../../games/types.ts";
import type { Answer, Dimension, Question, Scores } from "./types.ts";

export const leaderQuizConfig = {
  clubName: clubConfig.clubName,
  eventName: "社團博覽會",
  quizTitle: "探索你的領袖特質",
  quizSubtitle: "10 個大學生活情境，看看你最自然的領導方式。",
  prizeText: "社博當天抽 5 名，送手搖杯！",
  prizeHint: "完成測驗即登記抽獎",
  gameId: "leader-quiz",
  questionCount: 10,
  privacyNote: "資料僅用於本次活動抽獎、活動聯絡與統計用途。",
  disclaimer: "本測驗是互動探索，不是正式心理測驗。",
  recruitTitle: "想知道這些特質怎麼真正用在大學生活裡嗎？",
  dimensions: [
    {
      key: "vision" as const,
      kicker: "VISION",
      label: "遠見力",
      blurb: "看見現在以外的下一步，喜歡先找方向與可能性。",
    },
    {
      key: "empathy" as const,
      kicker: "EMPATHY",
      label: "同理心",
      blurb: "重視團隊感受，很自然地注意身邊的人。",
    },
    {
      key: "decision" as const,
      kicker: "DECISION",
      label: "決策力",
      blurb: "事情來了先行動，擅長把問題轉換成下一步。",
    },
    {
      key: "crisis" as const,
      kicker: "CRISIS",
      label: "應變力",
      blurb: "遇到突發狀況不容易卡住，常常能找到新的突破口。",
    },
  ],
  socialLinks: clubConfig.socialLinks,
} as const;

export const leaderQuizGame: GameDefinition<Question, Answer, Scores, Dimension> = {
  id: leaderQuizConfig.gameId,
  title: leaderQuizConfig.quizTitle,
  questions: QUESTIONS,
  score: (answers) => calculateScores(answers),
  result: (scores, answers) => calculateWinner(scores, answers),
};
