import type { LatestResult } from "./useLatestResult";
import { prizeLabel, sttLive } from "./prize";

/**
 * Renders a branded 1200x675 win card on an offscreen canvas so winners can
 * share a real image (native share sheet on mobile, copy/download on desktop)
 * instead of a bare link. Everything is drawn client-side — no backend call.
 */

const W = 1200;
const H = 675;

const SKY = "#90E0EF";
const BLUE = "#6596FE";
const TEAL = "#77D6E3";
const SILVER = "#9ca3af";

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Deterministic PRNG so the confetti layout is stable between renders. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/ST_LOGO_DARK@2x.png";
  });
}

export interface WinCard {
  blob: Blob;
  dataUrl: string;
  file: File;
}

export async function renderWinCard(result: LatestResult): Promise<WinCard> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  const glow1 = ctx.createRadialGradient(160, 60, 0, 160, 60, 520);
  glow1.addColorStop(0, "rgba(144,224,239,0.16)");
  glow1.addColorStop(1, "rgba(144,224,239,0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(1060, 640, 0, 1060, 640, 560);
  glow2.addColorStop(0, "rgba(101,150,254,0.15)");
  glow2.addColorStop(1, "rgba(101,150,254,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // Confetti (deterministic, kept faint so text stays readable)
  const rand = mulberry32(20260623);
  const colors = [SKY, BLUE, TEAL, "#ffffff"];
  for (let i = 0; i < 48; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const s = 3 + rand() * 6;
    ctx.save();
    ctx.globalAlpha = 0.14 + rand() * 0.2;
    ctx.fillStyle = colors[i % colors.length];
    ctx.translate(x, y);
    ctx.rotate(rand() * Math.PI);
    if (rand() > 0.5) {
      ctx.beginPath();
      ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-s / 2, -s / 4, s, s / 2);
    }
    ctx.restore();
  }

  // Frame
  roundedRect(ctx, 24, 24, W - 48, H - 48, 28);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const topLine = ctx.createLinearGradient(24, 0, W - 24, 0);
  topLine.addColorStop(0, "rgba(255,255,255,0)");
  topLine.addColorStop(0.5, "rgba(255,255,255,0.35)");
  topLine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = topLine;
  ctx.fillRect(80, 24, W - 160, 1.5);

  // Header: logo left, game name right
  const logo = await loadLogo();
  if (logo) {
    const lh = 38;
    const lw = (logo.width / logo.height) * lh;
    ctx.drawImage(logo, 64, 58, lw, lh);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 30px ${FONT}`;
    ctx.fillText("SilverTimes", 64, 88);
  }
  ctx.textAlign = "right";
  ctx.fillStyle = SILVER;
  ctx.font = `500 19px ${FONT}`;
  try {
    ctx.letterSpacing = "4px";
  } catch {
    // older canvas impls — fine without tracking
  }
  ctx.fillText("DAILY SILVER PREDICTION", W - 64, 86);
  try {
    ctx.letterSpacing = "0px";
  } catch {
    /* noop */
  }
  ctx.textAlign = "left";

  // Eyebrow
  ctx.fillStyle = SKY;
  ctx.font = `600 24px ${FONT}`;
  try {
    ctx.letterSpacing = "6px";
  } catch {
    /* noop */
  }
  const eyebrow =
    result.roundKey && result.roundKey !== "demo"
      ? `WINNER  ·  ${result.roundKey}`
      : "WINNER";
  ctx.fillText(eyebrow, 66, 262);
  try {
    ctx.letterSpacing = "0px";
  } catch {
    /* noop */
  }

  // Headline with brand gradient
  const headline = `Won ${prizeLabel(result.prize)}`;
  ctx.font = `800 108px ${FONT}`;
  const grad = ctx.createLinearGradient(64, 0, 820, 0);
  grad.addColorStop(0, SKY);
  grad.addColorStop(1, BLUE);
  ctx.fillStyle = grad;
  ctx.fillText(headline, 62, 372);

  // Detail lines
  ctx.fillStyle = "#e5e7eb";
  ctx.font = `500 33px ${FONT}`;
  ctx.fillText(
    `Predicted $${result.predictedPrice.toFixed(2)}   ·   Actual $${result.actualPrice.toFixed(2)}   ·   $${result.error.toFixed(2)} off`,
    66,
    440,
  );
  ctx.fillStyle = SKY;
  ctx.font = `500 28px ${FONT}`;
  ctx.fillText(
    `Top ${result.percentile}%   ·   +${result.points.toLocaleString()} pts`,
    66,
    492,
  );

  // Rank badge
  if (result.rank) {
    const cx = 1010;
    const cy = 300;
    const r = 104;
    const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ring.addColorStop(0, SKY);
    ring.addColorStop(1, BLUE);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fill();
    ctx.strokeStyle = ring;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 84px ${FONT}`;
    ctx.fillText(`#${result.rank}`, cx, cy + 22);
    ctx.fillStyle = SILVER;
    ctx.font = `600 20px ${FONT}`;
    try {
      ctx.letterSpacing = "5px";
    } catch {
      /* noop */
    }
    ctx.fillText("RANK", cx, cy + 62);
    try {
      ctx.letterSpacing = "0px";
    } catch {
      /* noop */
    }
    ctx.textAlign = "left";
  }

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(64, H - 122, W - 128, 1.5);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText("silvertimes.io/prediction", 66, H - 68);
  ctx.textAlign = "right";
  ctx.fillStyle = SILVER;
  ctx.font = `500 24px ${FONT}`;
  ctx.fillText(
    sttLive()
      ? "Guess the close · Top 5 win 0.1 STT daily"
      : "Guess the close · Top 5 win 5 USDT daily",
    W - 66,
    H - 68,
  );
  ctx.textAlign = "left";

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png",
    );
  });
  return {
    blob,
    dataUrl: canvas.toDataURL("image/png"),
    file: new File([blob], "silvertimes-win.png", { type: "image/png" }),
  };
}
