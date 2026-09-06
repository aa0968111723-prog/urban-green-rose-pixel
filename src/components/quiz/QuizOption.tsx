import type { OptionKey } from "@/features/leader-quiz/types";

type QuizOptionProps = {
  optionKey: OptionKey;
  text: string;
  selected: boolean;
  disabled: boolean;
  onSelect: (key: OptionKey) => void;
};

export function QuizOption({ optionKey, text, selected, disabled, onSelect }: QuizOptionProps) {
  return (
    <button
      type="button"
      className={selected ? "option selected" : "option"}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`選項 ${optionKey}：${text}`}
      onClick={() => onSelect(optionKey)}
    >
      <span className="opt-key" aria-hidden="true">
        {optionKey}
      </span>
      <span className="opt-text">{text}</span>
    </button>
  );
}
