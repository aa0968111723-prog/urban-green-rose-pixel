import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/staff")({
  component: StaffPage,
});

type Stats = {
  total: number;
  today: number;
  eligible: number;
  duplicates: number;
  duplicatePhones: number;
  successful: number;
  failed: number;
  prototypes: Record<string, number>;
  sources: { source: string; n: number }[];
  recent: {
    id: string;
    createdAt: string;
    name: string;
    department: string;
    phoneMasked: string;
    winner: string;
    source: string;
    raffleEligible: boolean;
  }[];
  draws: { id: string; created_at: string; winner_count: number }[];
};

const TOKEN_KEY = "lq:staff-token";

function StaffPage() {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState("");

  const headers = useCallback(
    () => ({ "x-staff-token": token, "content-type": "application/json" }),
    [token],
  );

  const load = useCallback(async () => {
    const res = await fetch("/api/staff/stats", { headers: headers() });
    const data = (await res.json()) as { ok: boolean; error?: string; stats?: Stats };
    if (!data.ok || !data.stats) {
      setError(data.error || "無法讀取後台");
      setUnlocked(false);
      return;
    }
    sessionStorage.setItem(TOKEN_KEY, token);
    setError("");
    setUnlocked(true);
    setStats(data.stats);
  }, [headers, token]);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  async function onDraw() {
    setDrawing(true);
    setDrawResult("");
    try {
      const res = await fetch("/api/staff/draw", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ count: 5 }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        winners?: { name: string; phoneMasked: string; position: number }[];
      };
      if (!data.ok) {
        setDrawResult(data.error || "抽獎失敗");
        return;
      }
      setDrawResult(
        (data.winners ?? []).map((w) => `${w.position}. ${w.name} ${w.phoneMasked}`).join("\n"),
      );
      await load();
    } finally {
      setDrawing(false);
    }
  }

  async function onExport() {
    const res = await fetch("/api/staff/export", { headers: headers() });
    if (!res.ok) {
      setError("匯出失敗");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lottery-winners.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="staff">
      <h1>領袖社活動後台</h1>
      {!unlocked ? (
        <form
          className="staff-card"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <label htmlFor="staff-token">Staff token</label>
          <input
            id="staff-token"
            type="password"
            value={token}
            autoComplete="off"
            onChange={(e) => setToken(e.target.value)}
          />
          {error ? <p className="staff-error">{error}</p> : null}
          <button type="submit">進入後台</button>
          <p className="staff-hint">以環境變數 STAFF_TOKEN 保護。開發模式可使用 preview。</p>
        </form>
      ) : stats ? (
        <div className="staff-grid">
          <section className="staff-card">
            <h2>總覽</h2>
            <ul>
              <li>總完成數：{stats.total}</li>
              <li>今日完成數：{stats.today}</li>
              <li>有效抽獎資格：{stats.eligible}</li>
              <li>重複作答（無新抽獎資格）：{stats.duplicates}</li>
              <li>重複電話數：{stats.duplicatePhones}</li>
              <li>成功寫入：{stats.successful}</li>
            </ul>
          </section>
          <section className="staff-card">
            <h2>四種原型分布</h2>
            {Object.entries(stats.prototypes).map(([key, n]) => (
              <div key={key} className="staff-bar">
                <span>{key}</span>
                <i style={{ width: `${stats.total ? (n / stats.total) * 100 : 0}%` }} />
                <em>{n}</em>
              </div>
            ))}
          </section>
          <section className="staff-card">
            <h2>QR / 來源分布</h2>
            {stats.sources.length === 0 ? <p>尚無來源資料</p> : null}
            {stats.sources.map((row) => (
              <p key={row.source}>
                {row.source}：{row.n}
              </p>
            ))}
          </section>
          <section className="staff-card">
            <h2>抽獎</h2>
            <button type="button" disabled={drawing} onClick={() => void onDraw()}>
              抽出 5 名
            </button>
            <button type="button" onClick={() => void onExport()}>
              匯出得獎 CSV
            </button>
            {drawResult ? <pre>{drawResult}</pre> : null}
            <h3>近期抽獎紀錄</h3>
            {stats.draws.map((d) => (
              <p key={d.id}>
                {d.id} · {d.created_at} · {d.winner_count} 名
              </p>
            ))}
          </section>
          <section className="staff-card staff-wide">
            <h2>最近 submission</h2>
            <div className="staff-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>時間</th>
                    <th>姓名</th>
                    <th>系級</th>
                    <th>電話</th>
                    <th>原型</th>
                    <th>來源</th>
                    <th>抽獎</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((row) => (
                    <tr key={row.id}>
                      <td>{row.createdAt}</td>
                      <td>{row.name}</td>
                      <td>{row.department}</td>
                      <td>{row.phoneMasked}</td>
                      <td>{row.winner}</td>
                      <td>{row.source || "—"}</td>
                      <td>{row.raffleEligible ? "有效" : "重複"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
