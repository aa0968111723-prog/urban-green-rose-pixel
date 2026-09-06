import { randomInt } from "node:crypto";
import { getSql } from "@/lib/db";
import { leaderQuizConfig } from "@/features/leader-quiz/leaderQuizConfig";
import { createDrawId, maskPhone } from "./ids.ts";

type EligibleRow = {
  id: string;
  name: string;
  department: string;
  phone: string;
  email: string | null;
  winner: string;
};

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const tmp = items[i];
    items[i] = items[j]!;
    items[j] = tmp!;
  }
  return items;
}

export async function drawLottery(count = 5) {
  const sql = await getSql();
  const eligible = await sql<EligibleRow>`
    select s.id, s.name, s.department, s.phone, s.email, s.winner
    from quiz_submissions s
    where s.game = ${leaderQuizConfig.gameId}
      and s.raffle_eligible = true
      and not exists (
        select 1 from quiz_lottery_winners w where w.submission_id = s.id
      )
  `;
  if (eligible.length === 0) {
    return { ok: false as const, error: "目前沒有可抽獎的有效名單", status: 400 };
  }
  const picked = shuffleInPlace([...eligible]).slice(0, Math.min(count, eligible.length));
  const drawId = createDrawId();
  await sql`
    insert into quiz_lottery_draws (id, game, winner_count)
    values (${drawId}, ${leaderQuizConfig.gameId}, ${picked.length})
  `;
  for (let i = 0; i < picked.length; i += 1) {
    const row = picked[i]!;
    await sql`
      insert into quiz_lottery_winners (draw_id, submission_id, position)
      values (${drawId}, ${row.id}, ${i + 1})
    `;
  }
  return {
    ok: true as const,
    drawId,
    winners: picked.map((row, index) => ({
      position: index + 1,
      submissionId: row.id,
      name: row.name,
      department: row.department,
      phoneMasked: maskPhone(row.phone),
      winner: row.winner,
    })),
  };
}

export function toCsv(rows: string[][]): string {
  return rows
    .map((cols) =>
      cols
        .map((col) => {
          const value = col.replaceAll('"', '""');
          return /[",\n]/.test(value) ? `"${value}"` : value;
        })
        .join(","),
    )
    .join("\n");
}

export async function exportWinnersCsv(): Promise<string> {
  const sql = await getSql();
  const rows = await sql<{
    draw_id: string;
    created_at: string;
    position: number;
    submission_id: string;
    name: string;
    department: string;
    phone: string;
    email: string | null;
    winner: string;
  }>`
    select d.id as draw_id, d.created_at::text as created_at, w.position,
           s.id as submission_id, s.name, s.department, s.phone, s.email, s.winner
    from quiz_lottery_winners w
    join quiz_lottery_draws d on d.id = w.draw_id
    join quiz_submissions s on s.id = w.submission_id
    where d.game = ${leaderQuizConfig.gameId}
    order by d.created_at desc, w.position asc
  `;
  return toCsv([
    ["draw_id", "drawn_at", "position", "submission_id", "name", "department", "phone", "email", "winner"],
    ...rows.map((r) => [
      r.draw_id,
      r.created_at,
      String(r.position),
      r.submission_id,
      r.name,
      r.department,
      r.phone,
      r.email ?? "",
      r.winner,
    ]),
  ]);
}
