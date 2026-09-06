import type { OptionKey, Question } from "@/features/leader-quiz/types";
import { QuizOption } from "./QuizOption";

type QuizQuestionProps = {
  question: Question;
  selectedKey: OptionKey | null;
  disabled: boolean;
  onSelect: (key: OptionKey) => void;
};

export function QuizQuestion({ question, selectedKey, disabled, onSelect }: QuizQuestionProps) {
  return (
    <div className="q-card" key={question.id}>
      <span className="tag">{question.category}</span>
      <p className="q-text">{question.question}</p>
      <div className="options">
        {question.options.map((option) => (
          <QuizOption
            key={option.key}
            optionKey={option.key}
            text={option.text}
            selected={selectedKey === option.key}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
