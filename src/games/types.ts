/** Shared shape for booth / campus interactive games. Keep this small — not a CMS. */
export type GameDefinition<TQuestion, TAnswer, TScores, TResult> = {
  id: string;
  title: string;
  questions: readonly TQuestion[];
  score: (answers: readonly TAnswer[]) => TScores;
  result: (scores: TScores, answers: readonly TAnswer[]) => TResult;
};
