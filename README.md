# 探索你的領袖特質

淡江大學領袖社社博現場互動測驗。10 個大學生活情境，算出遠見力、同理心、決策力、應變力四維傾向，並登記抽獎。

本測驗是互動探索，不是正式心理測驗。

## 本地啟動

```bash
npm install
npm run dev
```

開發伺服器在 `http://127.0.0.1:8080`。沒有設定 `DATABASE_URL` 時會使用內建 PGLite（重啟後資料會清空）。

常用指令：

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## 測驗架構

- 正式頁面：`/`（`/quiz` 相同）
- 舊網址 `/leader-quiz.html` 會保留 query string 並轉到 `/`
- 題庫、計分、結果文案都在 TypeScript 模組，不再塞進單一 HTML

```text
src/features/leader-quiz/     測驗 UI、題庫、計分
src/components/quiz/          共用進度條 / 選項 / 雷達圖 / 分享卡
src/config/clubConfig.ts      社團連結（空字串 = 按鈕停用）
src/games/types.ts            未來多遊戲的 GameDefinition
src/server/quiz/              submission / 後台 / 抽獎
src/routes/api/quiz/submit.ts POST /api/quiz/submit
src/routes/staff.tsx          /staff
```

分數永遠由答案重算：`answers → calculateScores() → calculateWinner()`。

## 題庫與結果文案

| 要改什麼 | 檔案 |
| --- | --- |
| 題目 | `src/features/leader-quiz/data/questions.ts` |
| 四種原型文案、優勢、練習、社團角色 | `src/features/leader-quiz/data/prototypes.ts` |
| 活動名稱、獎品、隱私文字 | `src/features/leader-quiz/leaderQuizConfig.ts` |
| IG / 認識社團 / 報名連結 | `src/config/clubConfig.ts` |

未提供真實 URL 時請保持空字串，畫面上會顯示停用按鈕，不要填假網址。

## Submission API

`POST /api/quiz/submit`

前端只送：

```json
{
  "name": "小華",
  "department": "資工一A",
  "phone": "0912345678",
  "email": "",
  "answers": [{ "questionId": 1, "choice": "A" }],
  "source": "booth-a",
  "utm_source": "ig",
  "utm_medium": "",
  "utm_campaign": ""
}
```

後端會自行驗證 10 題、重算四維分數與 winner，再寫入資料庫。不要相信前端送來的 score / title。

成功才回：

```json
{ "ok": true, "submissionId": "LQ-20260906-A7K4P", "winner": "vision", "scores": {}, "alreadyRegistered": false }
```

同一活動中 `phone + game` 只能有一個有效抽獎資格。允許重測，但會回 `alreadyRegistered: true`。

## DB migration

`migrations/0002_quiz_submissions.sql`

表格：

- `quiz_submissions`（含 utm / source / raffle_eligible）
- `quiz_lottery_draws`
- `quiz_lottery_winners`

部署時 `npm run build` 會跑 `npm run db:migrate`。Preview 會在啟動時自動套用。

## 環境變數

不要建立 `.env` 檔。部署平台注入即可。

| 變數 | 用途 |
| --- | --- |
| `DATABASE_URL` | Neon Postgres。未設定時用 PGLite |
| `STAFF_TOKEN` | `/staff` 與 staff API 的保護。正式環境必填 |
| `GOOGLE_SCRIPT_URL` | 選用。伺服器端第二出口，寫入 Google Sheet |

開發模式未設 `STAFF_TOKEN` 時，後台 token 為 `preview`。

## Staff dashboard

路徑：`/staff`

顯示總完成數、今日完成數、原型分布、QR source、最近名單（電話遮罩 `0912****78`）、抽獎。抽獎在伺服器端進行，可匯出 CSV。

## Google Sheet fallback

1. 把 `public/google-apps-script.gs` 貼到 Apps Script 並部署
2. 只把網址設到伺服器環境變數 `GOOGLE_SCRIPT_URL`
3. 資料仍由 server 驗證後才轉送

## 來源追蹤

QR / 海報 / IG 請帶 query，例如：

- `/?source=booth-a`
- `/?source=poster`
- `/?utm_source=ig`

## 測驗分布（全組合模擬）

`npm test` 會枚舉 4^10 種答案。目前約：

- Vision 22.3% / Empathy 19.6% / Decision 34.3% / Crisis 23.8%
- Tie rate 11.3%

未達「嚴重偏斜」門檻，因此沒有改題。若之後希望更接近 25%，請人工調整 `questions.ts`，不要讓程式自動改題。

## Deployment

Vercel（既有 TanStack Start + Nitro preset）。確認正式環境有 `DATABASE_URL` 與 `STAFF_TOKEN`。
