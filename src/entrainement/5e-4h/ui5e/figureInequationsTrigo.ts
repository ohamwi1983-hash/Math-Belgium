import type { ExerciceInequationTrigo, ValeurExacte } from "../core5e/inequationsTrigo";
import { estStrict, valeurM } from "../core5e/inequationsTrigo";
import { qVal } from "./nombresTrigo";

/**
 * Figure de `5gen55` (écran, corrigé papier) : cercle trigonométrique, droite y = m (sinus) ou
 * x = m (cosinus) et ses deux points d'intersection ; avec `arc`, l'arc solution en couleur (bornes
 * pleines si l'inégalité est large, creuses si elle est stricte). Fond blanc, traits sombres : lisible
 * à l'écran (thème clair ou sombre) et à l'impression. Sans `arc`, la figure ne dit pas quel arc garder.
 */

const W = 260;
const C = 130;
const R = 92;
const f2 = (x: number) => (Math.round(x * 100) / 100).toString();
const POLICE = 'font-family="Georgia, \'Times New Roman\', serif"';

function valeurT(v: ValeurExacte): string {
  const s = v.num.n < 0 ? "−" : "";
  const n = Math.abs(v.num.n);
  if (v.rad === 1) return v.num.d === 1 ? `${s}${n}` : `${s}${n}/${v.num.d}`;
  return `${s}${n === 1 ? "" : n}√${v.rad}${v.num.d === 1 ? "" : "/" + v.num.d}`;
}

const X = (t: number) => C + R * Math.cos(t);
const Y = (t: number) => C - R * Math.sin(t);

export function figureCercleInequation(e: ExerciceInequationTrigo, arc: boolean): string {
  const p: string[] = [];
  p.push(`<rect x="0" y="0" width="${W}" height="${W}" fill="#ffffff"/>`);
  // Axes avec flèches
  p.push(`<line x1="12" y1="${C}" x2="${W - 10}" y2="${C}" stroke="#555" stroke-width="1.1"/><path d="M ${W - 8} ${C} l -8 -4 l 0 8 z" fill="#555"/>`);
  p.push(`<line x1="${C}" y1="${W - 12}" x2="${C}" y2="10" stroke="#555" stroke-width="1.1"/><path d="M ${C} 8 l -4 8 l 8 0 z" fill="#555"/>`);
  p.push(`<text x="${W - 14}" y="${C + 16}" font-size="12" ${POLICE} fill="#333" text-anchor="end">cos</text>`);
  p.push(`<text x="${C + 7}" y="20" font-size="12" ${POLICE} fill="#333">sin</text>`);
  p.push(`<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#222" stroke-width="1.6"/>`);
  for (const [x, y, t, ancre] of [
    [C + R + 3, C - 4, "1", "start"],
    [C - R - 3, C - 4, "−1", "end"],
    [C + 5, C - R - 4, "1", "start"],
    [C + 5, C + R + 13, "−1", "start"],
  ] as const)
    p.push(`<text x="${x}" y="${y}" font-size="10.5" ${POLICE} fill="#333" text-anchor="${ancre}">${t}</text>`);
  const m = valeurM(e.m);
  if (Math.abs(m) <= 1) {
    let t1: number, t2: number;
    let etiquette = "";
    if (e.fonction === "sin") {
      const y = C - R * m;
      p.push(`<line x1="16" y1="${f2(y)}" x2="${W - 16}" y2="${f2(y)}" stroke="#b65c1f" stroke-width="1.3" stroke-dasharray="5 4"/>`);
      etiquette = (`<text x="18" y="${f2(m > 0.75 ? y + 14 : y - 5)}" font-size="11.5" ${POLICE} fill="#b65c1f" stroke="#ffffff" stroke-width="3.5" paint-order="stroke">sin u = ${valeurT(e.m)}</text>`);
      t1 = Math.asin(m);
      t2 = Math.PI - t1;
    } else {
      const x = C + R * m;
      p.push(`<line x1="${f2(x)}" y1="16" x2="${f2(x)}" y2="${W - 16}" stroke="#b65c1f" stroke-width="1.3" stroke-dasharray="5 4"/>`);
      etiquette = (`<text x="${f2(m > 0.4 ? x - 5 : x + 5)}" y="${W - 18}" font-size="11.5" ${POLICE} fill="#b65c1f" stroke="#ffffff" stroke-width="3.5" paint-order="stroke" text-anchor="${m > 0.4 ? "end" : "start"}">cos u = ${valeurT(e.m)}</text>`);
      t1 = Math.acos(m);
      t2 = -t1;
    }
    if (arc && e.arcU) {
      const a = qVal(e.arcU[0]) * Math.PI;
      const b = qVal(e.arcU[1]) * Math.PI;
      const grand = b - a > Math.PI ? 1 : 0;
      p.push(`<path d="M ${f2(X(a))} ${f2(Y(a))} A ${R} ${R} 0 ${grand} 0 ${f2(X(b))} ${f2(Y(b))}" fill="none" stroke="#1a7f37" stroke-width="5" stroke-linecap="butt" opacity="0.85"/>`);
    }
    const creux = arc && estStrict(e.symbole);
    for (const t of [t1, t2]) p.push(`<circle cx="${f2(X(t))}" cy="${f2(Y(t))}" r="4.2" fill="${creux ? "#ffffff" : "#222"}" stroke="#222" stroke-width="1.4"/>`);
    p.push(etiquette);
  }
  p.push(`<circle cx="${C}" cy="${C}" r="2" fill="#222"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}" role="img" aria-label="Cercle trigonométrique">${p.join("")}</svg>`;
}
