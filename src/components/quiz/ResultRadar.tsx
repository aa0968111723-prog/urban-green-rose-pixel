import { useEffect, useRef } from "react";
import { DIMENSIONS, type Dimension, type Scores } from "@/features/leader-quiz/types";
import { dimensionLabel } from "@/features/leader-quiz/lib/result";
import { normalizeScores } from "@/features/leader-quiz/lib/scoring";

type ResultRadarProps = {
  scores: Scores;
};

const AXES: { key: Dimension; angle: number }[] = [
  { key: "vision", angle: -Math.PI / 2 },
  { key: "empathy", angle: 0 },
  { key: "decision", angle: Math.PI / 2 },
  { key: "crisis", angle: Math.PI },
];

function drawRadar(canvas: HTMLCanvasElement, scores: Scores) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 320;
  const cssHeight = canvas.clientHeight || 320;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const cx = cssWidth / 2;
  const cy = cssHeight / 2;
  const radius = Math.min(cssWidth, cssHeight) * 0.3;
  const normalized = normalizeScores(scores);
  const levels = 4;

  ctx.strokeStyle = "rgba(36,51,63,0.10)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= levels; i += 1) {
    ctx.beginPath();
    AXES.forEach((ax, idx) => {
      const r = radius * (i / levels);
      const x = cx + Math.cos(ax.angle) * r;
      const y = cy + Math.sin(ax.angle) * r;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(36,51,63,0.16)";
  AXES.forEach((ax) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ax.angle) * radius, cy + Math.sin(ax.angle) * radius);
    ctx.stroke();
  });

  ctx.beginPath();
  AXES.forEach((ax, idx) => {
    const r = radius * normalized[ax.key];
    const x = cx + Math.cos(ax.angle) * r;
    const y = cy + Math.sin(ax.angle) * r;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(123, 201, 111, 0.32)";
  ctx.strokeStyle = "#5EA85A";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  AXES.forEach((ax) => {
    const r = radius * normalized[ax.key];
    const x = cx + Math.cos(ax.angle) * r;
    const y = cy + Math.sin(ax.angle) * r;
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#7BC96F";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  ctx.fillStyle = "#24333F";
  ctx.font = `700 13px ${getComputedStyle(document.body).fontFamily}`;
  ctx.strokeStyle = "rgba(255,253,247,0.92)";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  AXES.forEach((ax) => {
    const pad = ax.key === "vision" || ax.key === "decision" ? 28 : 36;
    const lx = cx + Math.cos(ax.angle) * (radius + pad);
    const ly = cy + Math.sin(ax.angle) * (radius + pad);
    if (ax.key === "crisis") ctx.textAlign = "right";
    else if (ax.key === "empathy") ctx.textAlign = "left";
    else ctx.textAlign = "center";
    if (ax.key === "vision") ctx.textBaseline = "bottom";
    else if (ax.key === "decision") ctx.textBaseline = "top";
    else ctx.textBaseline = "middle";
    const label = dimensionLabel(ax.key);
    ctx.strokeText(label, lx, ly);
    ctx.fillText(label, lx, ly);
  });
}

export function ResultRadar({ scores }: ResultRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const redraw = () => drawRadar(canvas, scores);
    redraw();
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    window.addEventListener("resize", redraw);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", redraw);
    };
  }, [scores]);

  const normalized = normalizeScores(scores);
  const summary = DIMENSIONS.map(
    (dim) => `${dimensionLabel(dim)} ${scores[dim]} 分（${Math.round(normalized[dim] * 100)}%）`,
  ).join("、");

  return (
    <div className="radar-card">
      <p className="section-label">四軸雷達圖</p>
      <canvas ref={canvasRef} className="radar-canvas" aria-hidden="true" />
      <ul className="radar-text" aria-label={`四維分數：${summary}`}>
        {DIMENSIONS.map((dim) => (
          <li key={dim}>
            {dimensionLabel(dim)} {scores[dim]} 分
          </li>
        ))}
      </ul>
    </div>
  );
}
