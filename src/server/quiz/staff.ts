import { getSql } from "@/lib/db";
import { leaderQuizConfig } from "@/features/leader-quiz/leaderQuizConfig";
import { taipeiDateStamp } from "@/features/leader-quiz/lib/time";
import { DIMENSIONS } from "@/features/leader-quiz/types";
import { maskPhone } from "./ids.ts";

export async function staffStats() {
  const sql = await getSql();
  const game = leaderQuizConfig.gameId;
  const today = taipeiDateStamp();

  const [totals] = await sql<{
    total: number;
    eligible: number;
    duplicates: number;
    today: number;
  }>`
    select
      count(*)::int as total,
      count(*) filter (where raffle_eligible)::int as eligible,
      count(*) filter (where not raffle_eligible)::int as duplicates,
      count(*) filter (
        where to_char(created_at at time zone 'Asia/Taipei', 'YYYYMMDD') = ${today}
      )::int as today
    from quiz_submissions
    where game = ${game}
  `;

  const protoRows = await sql<{ winner: string; n: number }>`
    select winner, count(*)::int as n
    from quiz_submissions
    where game = ${game}
    group by winner
  `;
  const prototypes: Record<string, number> = {
    vision: 0,
    empathy: 0,
    decision: 0,
    crisis: 0,
  };
  for (const row of protoRows) prototypes[row.winner] = row.n;

  const sourceRows = await sql<{ source: string | null; n: number }>`
    select coalesce(nullif(source, ''), utm_source, '(none)') as source, count(*)::int as n
    from quiz_submissions
    where game = ${game}
    group by 1
    order by n desc
  `;

  const duplicatePhones = await sql<{ n: number }>`
    select count(*)::int as n from (
      select phone from quiz_submissions
      where game = ${game}
      group by phone
      having count(*) > 1
    ) t
  `;

  const recent = await sql<{
    id: string;
    created_at: string;
    name: string;
    department: string;
    phone: string;
    winner: string;
    source: string | null;
    raffle_eligible: boolean;
  }>`
    select id, created_at::text as created_at, name, department, phone, winner, source, raffle_eligible
    from quiz_submissions
    where game = ${game}
    order by created_at desc
    limit 30
  `;

  const draws = await sql<{
    id: string;
    created_at: string;
    winner_count: number;
  }>`
    select id, created_at::text as created_at, winner_count
    from quiz_lottery_draws
    where game = ${game}
    order by created_at desc
    limit 10
  `;

  return {
    total: totals?.total ?? 0,
    today: totals?.today ?? 0,
    eligible: totals?.eligible ?? 0,
    duplicates: totals?.duplicates ?? 0,
    duplicatePhones: duplicatePhones[0]?.n ?? 0,
    successful: totals?.total ?? 0,
    failed: 0,
    prototypes,
    dimensions: DIMENSIONS,
    sources: sourceRows.map((r) => ({ source: r.source ?? "(none)", n: r.n })),
    recent: recent.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      name: r.name,
      department: r.department,
      phoneMasked: maskPhone(r.phone),
      winner: r.winner,
      source: r.source ?? "",
      raffleEligible: r.raffle_eligible,
    })),
    draws,
  };
}
