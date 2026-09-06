import { getSql } from "@/lib/db";
import { leaderQuizConfig } from "@/features/leader-quiz/leaderQuizConfig";
import { evaluateQuizPayload } from "@/features/leader-quiz/lib/evaluate";
import { createSubmissionId } from "./ids.ts";
import { clientIp, MAX_BODY_BYTES, rateLimit, SUBMIT_LIMIT } from "./rate-limit.ts";
import { maybePostGoogleSheet } from "./sheet-fallback.ts";

type SubmitOk = {
  ok: true;
  submissionId: string;
  winner: string;
  scores: Record<string, number>;
  alreadyRegistered: boolean;
};

type SubmitErr = { ok: false; error: string };

export async function handleQuizSubmit(
  request: Request,
): Promise<{ status: number; body: SubmitOk | SubmitErr }> {
  const limited = rateLimit(`submit:${clientIp(request)}`, SUBMIT_LIMIT);
  if (!limited.ok) {
    return { status: 429, body: { ok: false, error: "請稍後再試" } };
  }

  const rawText = await request.text();
  if (rawText.length > MAX_BODY_BYTES) {
    return { status: 413, body: { ok: false, error: "資料過大" } };
  }

  let json: unknown;
  try {
    json = JSON.parse(rawText);
  } catch {
    return { status: 400, body: { ok: false, error: "JSON 格式不正確" } };
  }

  const evaluated = evaluateQuizPayload(json);
  if (!evaluated.ok) {
    return { status: evaluated.status, body: { ok: false, error: evaluated.error } };
  }

  const { registration, answers, scores, winner, tracking } = evaluated.value;
  const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 256);
  const submissionId = createSubmissionId();
  const sql = await getSql();

  const existing = await sql<{ id: string }>`
    select id from quiz_submissions
    where phone = ${registration.phone} and game = ${leaderQuizConfig.gameId} and raffle_eligible = true
    limit 1
  `;
  const alreadyRegistered = existing.length > 0;

  try {
    await sql`
      insert into quiz_submissions (
        id, game, name, department, phone, email, winner,
        vision_score, empathy_score, decision_score, crisis_score,
        answers_json, user_agent, source, utm_source, utm_medium, utm_campaign,
        raffle_eligible
      ) values (
        ${submissionId},
        ${leaderQuizConfig.gameId},
        ${registration.name},
        ${registration.department},
        ${registration.phone},
        ${registration.email || null},
        ${winner},
        ${scores.vision},
        ${scores.empathy},
        ${scores.decision},
        ${scores.crisis},
        ${JSON.stringify(answers)}::jsonb,
        ${userAgent || null},
        ${tracking.source || null},
        ${tracking.utmSource || null},
        ${tracking.utmMedium || null},
        ${tracking.utmCampaign || null},
        ${alreadyRegistered ? false : true}
      )
    `;
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/quiz_submissions_phone_game_eligible/i.test(message) || /unique/i.test(message)) {
      await sql`
        insert into quiz_submissions (
          id, game, name, department, phone, email, winner,
          vision_score, empathy_score, decision_score, crisis_score,
          answers_json, user_agent, source, utm_source, utm_medium, utm_campaign,
          raffle_eligible
        ) values (
          ${submissionId},
          ${leaderQuizConfig.gameId},
          ${registration.name},
          ${registration.department},
          ${registration.phone},
          ${registration.email || null},
          ${winner},
          ${scores.vision},
          ${scores.empathy},
          ${scores.decision},
          ${scores.crisis},
          ${JSON.stringify(answers)}::jsonb,
          ${userAgent || null},
          ${tracking.source || null},
          ${tracking.utmSource || null},
          ${tracking.utmMedium || null},
          ${tracking.utmCampaign || null},
          ${false}
        )
      `;
      void maybePostGoogleSheet(evaluated.value, submissionId, true);
      return {
        status: 200,
        body: { ok: true, submissionId, winner, scores, alreadyRegistered: true },
      };
    }
    console.error("[quiz/submit] insert failed", err);
    return { status: 500, body: { ok: false, error: "伺服器暫時無法登記，請稍後再試" } };
  }

  void maybePostGoogleSheet(evaluated.value, submissionId, alreadyRegistered);
  return {
    status: 200,
    body: { ok: true, submissionId, winner, scores, alreadyRegistered },
  };
}
