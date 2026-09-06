import { leaderQuizConfig } from "../leaderQuizConfig.ts";
import type { Dimension, Prototype, Scores } from "../types.ts";
import { dimensionLabel } from "./result.ts";
import { DIMENSIONS } from "../types.ts";
import { normalizeScores } from "./scoring.ts";

export const SHARE_WIDTH = 1080;
export const SHARE_HEIGHT = 1920;

export type ShareCardInput = {
  name?: string;
  showName: boolean;
  prototype: Prototype;
  scores: Scores;
  winner: Dimension;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawBadge(ctx: CanvasRenderingContext2D, winner: Dimension, cx: number, cy: number) {
  const colors: Record<Dimension, { ring: string; fill: string }> = {
    vision: { ring: "#E8F4FF", fill: "#5BA4E6" },
    empathy: { ring: "#E7F8E3", fill: "#7BC96F" },
    decision: { ring: "#FFE8D2", fill: "#FFA95A" },
    crisis: { ring: "#FFF6D8", fill: "#E8B84A" },
  };
  const c = colors[winner];
  ctx.beginPath();
  ctx.arc(cx, cy, 92, 0, Math.PI * 2);
  ctx.fillStyle = c.ring;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.fillStyle = c.fill;
  ctx.fill();
  ctx.fillStyle = "#FFFDF7";
  ctx.font = "800 42px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const glyph: Record<Dimension, string> = {
    vision: "遠",
    empathy: "同",
    decision: "決",
    crisis: "應",
  };
  ctx.fillText(glyph[winner], cx, cy + 2);
}

export function drawShareCard(canvas: HTMLCanvasElement, input: ShareCardInput): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = SHARE_WIDTH;
  canvas.height = SHARE_HEIGHT;

  const sky = ctx.createLinearGradient(0, 0, 0, SHARE_HEIGHT);
  sky.addColorStop(0, "#8EC8F2");
  sky.addColorStop(0.28, "#FFF8EE");
  sky.addColorStop(1, "#F3E2C0");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);

  ctx.beginPath();
  ctx.arc(900, 80, 160, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 215, 106, 0.55)";
  ctx.fill();

  roundRect(ctx, 72, 96, SHARE_WIDTH - 144, SHARE_HEIGHT - 192, 48);
  ctx.fillStyle = "#FFFDF8";
  ctx.fill();

  ctx.fillStyle = "#4F9A4C";
  ctx.font = "700 28px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(leaderQuizConfig.clubName, SHARE_WIDTH / 2, 180);

  ctx.fillStyle = "#2A2E28";
  ctx.font = "900 64px 'Zen Maru Gothic', 'Noto Sans TC', sans-serif";
  ctx.fillText(leaderQuizConfig.quizTitle, SHARE_WIDTH / 2, 270);

  if (input.showName && input.name) {
    ctx.fillStyle = "#5E675C";
    ctx.font = "700 32px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    ctx.fillText(input.name, SHARE_WIDTH / 2, 330);
  }

  drawBadge(ctx, input.winner, SHARE_WIDTH / 2, 500);

  ctx.fillStyle = "#2A2E28";
  ctx.font = "900 56px 'Zen Maru Gothic', 'Noto Sans TC', sans-serif";
  ctx.fillText(input.prototype.title, SHARE_WIDTH / 2, 640);

  ctx.fillStyle = "#5E675C";
  ctx.font = "500 30px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
  wrapText(ctx, input.prototype.tagline, SHARE_WIDTH / 2, 710, SHARE_WIDTH - 220, 42);

  const normalized = normalizeScores(input.scores);
  let barY = 860;
  for (const dim of DIMENSIONS) {
    ctx.textAlign = "left";
    ctx.fillStyle = "#2A2E28";
    ctx.font = "700 28px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
    ctx.fillText(dimensionLabel(dim), 140, barY);
    ctx.textAlign = "right";
    ctx.fillStyle = "#5E675C";
    ctx.fillText(`${input.scores[dim]} 分`, SHARE_WIDTH - 140, barY);
    roundRect(ctx, 140, barY + 16, SHARE_WIDTH - 280, 22, 11);
    ctx.fillStyle = "#F1E8D8";
    ctx.fill();
    const fill = normalized[dim] * (SHARE_WIDTH - 280);
    const colors: Record<Dimension, string> = {
      vision: "#4E9FDC",
      empathy: "#7BC96F",
      decision: "#F0A24A",
      crisis: "#E2B03A",
    };
    roundRect(ctx, 140, barY + 16, Math.max(22, fill), 22, 11);
    ctx.fillStyle = colors[dim];
    ctx.fill();
    barY += 110;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#4F9A4C";
  ctx.font = "800 30px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
  ctx.fillText(`${leaderQuizConfig.clubName} · ${leaderQuizConfig.eventName}`, SHARE_WIDTH / 2, 1680);

  ctx.fillStyle = "#7A8474";
  ctx.font = "500 22px 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
  ctx.fillText(leaderQuizConfig.disclaimer, SHARE_WIDTH / 2, 1740);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const chars = [...text];
  let line = "";
  let yy = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = ch;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

export async function canvasToPngFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("png failed"))), "image/png");
  });
  return new File([blob], filename, { type: "image/png" });
}

export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function downloadPng(file: File): Promise<void> {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
