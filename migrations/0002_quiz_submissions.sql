create table if not exists quiz_submissions (
  id text primary key,
  game text not null,
  created_at timestamptz not null default now(),
  name text not null,
  department text not null,
  phone text not null,
  email text,
  winner text not null,
  vision_score integer not null,
  empathy_score integer not null,
  decision_score integer not null,
  crisis_score integer not null,
  answers_json jsonb not null,
  user_agent text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  raffle_eligible boolean not null default true
);

create unique index if not exists quiz_submissions_phone_game_eligible_idx
  on quiz_submissions (phone, game)
  where raffle_eligible = true;

create index if not exists quiz_submissions_game_created_idx
  on quiz_submissions (game, created_at desc);

create index if not exists quiz_submissions_game_source_idx
  on quiz_submissions (game, source);

create table if not exists quiz_lottery_draws (
  id text primary key,
  game text not null,
  created_at timestamptz not null default now(),
  winner_count integer not null
);

create table if not exists quiz_lottery_winners (
  draw_id text not null references quiz_lottery_draws (id),
  submission_id text not null references quiz_submissions (id),
  position integer not null,
  primary key (draw_id, submission_id)
);

create unique index if not exists quiz_lottery_winners_submission_idx
  on quiz_lottery_winners (submission_id);
