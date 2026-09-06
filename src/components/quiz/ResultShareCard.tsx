import { useEffect, useRef, useState } from "react";
import {
  canUseWebShare,
  canvasToPngFile,
  downloadPng,
  drawShareCard,
} from "@/features/leader-quiz/lib/share-card";
import { leaderQuizConfig } from "@/features/leader-quiz/leaderQuizConfig";
import type { Dimension, Prototype, Scores } from "@/features/leader-quiz/types";

type ResultShareCardProps = {
  name: string;
  prototype: Prototype;
  scores: Scores;
  winner: Dimension;
};

export function ResultShareCard({ name, prototype, scores, winner }: ResultShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showName, setShowName] = useState(true);
  const [busy, setBusy] = useState(false);
  const shareSupported = canUseWebShare();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => drawShareCard(canvas, { name, showName, prototype, scores, winner });
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(paint);
    }
    paint();
  }, [name, showName, prototype, scores, winner]);

  async function makeFile() {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("no canvas");
    drawShareCard(canvas, { name, showName, prototype, scores, winner });
    return canvasToPngFile(canvas, "leader-card.png");
  }

  async function onSave() {
    setBusy(true);
    try {
      const file = await makeFile();
      await downloadPng(file);
    } finally {
      setBusy(false);
    }
  }

  async function onShare() {
    setBusy(true);
    try {
      const file = await makeFile();
      const payload: ShareData = {
        title: leaderQuizConfig.quizTitle,
        text: `我的領袖原型是「${prototype.title}」`,
        files: [file],
      };
      if (navigator.canShare?.(payload)) {
        await navigator.share(payload);
        return;
      }
      await navigator.share?.({
        title: leaderQuizConfig.quizTitle,
        text: `我的領袖原型是「${prototype.title}」`,
      });
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      await onSave();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="share-card">
      <p className="section-label">產生我的領袖卡</p>
      <label className="share-name">
        <input
          type="checkbox"
          checked={showName}
          onChange={(e) => setShowName(e.target.checked)}
        />
        結果卡顯示姓名
      </label>
      <canvas ref={canvasRef} className="share-preview" aria-label="領袖卡預覽" />
      <div className="share-actions">
        {shareSupported ? (
          <button className="cta" type="button" disabled={busy} onClick={() => void onShare()}>
            分享結果
          </button>
        ) : null}
        <button
          className={shareSupported ? "cta secondary" : "cta"}
          type="button"
          disabled={busy}
          onClick={() => void onSave()}
        >
          儲存結果卡
        </button>
      </div>
    </div>
  );
}
