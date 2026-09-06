export function QuizAtmosphere() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="sun" />
      <svg className="vine vine-l" viewBox="0 0 120 220" aria-hidden="true">
        <path
          d="M88 220 C40 170 90 130 30 90 C80 110 20 40 52 8"
          fill="none"
          stroke="#6FBE66"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <ellipse cx="28" cy="86" rx="16" ry="10" fill="#7BC96F" transform="rotate(-30 28 86)" />
        <ellipse cx="70" cy="128" rx="18" ry="11" fill="#8ED97F" transform="rotate(20 70 128)" />
        <ellipse cx="42" cy="168" rx="20" ry="12" fill="#67B85F" transform="rotate(-18 42 168)" />
      </svg>
      <svg className="vine vine-r" viewBox="0 0 120 220" aria-hidden="true">
        <path
          d="M88 220 C40 170 90 130 30 90 C80 110 20 40 52 8"
          fill="none"
          stroke="#6FBE66"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <ellipse cx="28" cy="86" rx="16" ry="10" fill="#7BC96F" transform="rotate(-30 28 86)" />
        <ellipse cx="70" cy="128" rx="18" ry="11" fill="#8ED97F" transform="rotate(20 70 128)" />
        <ellipse cx="42" cy="168" rx="20" ry="12" fill="#67B85F" transform="rotate(-18 42 168)" />
      </svg>
      <div className="deck" />
    </div>
  );
}
