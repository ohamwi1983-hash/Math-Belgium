import type { ExerciceArchimedePi } from "../core5e/archimedePi";

/**
 * Figure de `5gen56` (écran et énoncé papier) — même construction que la figure du cours (§ 1) :
 * cercle de centre C, polygone régulier inscrit (côté [AB] en vert, H milieu de [AB]) et polygone
 * circonscrit en tirets (côté [DE] tangent en F), angle α = HCB marqué, angles droits en H et F.
 * Aucune mesure n'est écrite (rien à lire : la figure situe les notations). Fond blanc.
 */

const W = 320;
const H = 300;
const CX = 140;
const CY = 150;
const f2 = (x: number) => (Math.round(x * 100) / 100).toString();
const POLICE = 'font-family="Georgia, \'Times New Roman\', serif"';

export function figureArchimede(e: ExerciceArchimedePi): string {
  const n = e.n;
  const a = Math.PI / n;
  const R = Math.min(95, 128 * Math.cos(a));
  const Rc = R / Math.cos(a);
  const P = (r: number, t: number) => [CX + r * Math.cos(t), CY - r * Math.sin(t)] as const;
  const poly = (r: number) =>
    Array.from({ length: n }, (_, j) => P(r, a + 2 * a * j))
      .map(([x, y]) => `${f2(x)},${f2(y)}`)
      .join(" ");
  const p: string[] = [];
  p.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`);
  p.push(`<circle cx="${CX}" cy="${CY}" r="${f2(R)}" fill="none" stroke="#888" stroke-width="1.2"/>`);
  p.push(`<polygon points="${poly(Rc)}" fill="none" stroke="#b65c1f" stroke-width="1.3" stroke-dasharray="5 3"/>`);
  p.push(`<polygon points="${poly(R)}" fill="none" stroke="#222" stroke-width="1.4"/>`);
  const [ax, ay] = P(R, -a);
  const [bx, by] = P(R, a);
  const [dx, dy] = P(Rc, a);
  const [ex, ey] = P(Rc, -a);
  const hx = CX + R * Math.cos(a);
  const fx = CX + R;
  // Côtés mis en évidence
  p.push(`<line x1="${f2(ax)}" y1="${f2(ay)}" x2="${f2(bx)}" y2="${f2(by)}" stroke="#1a7f37" stroke-width="2.6"/>`);
  p.push(`<line x1="${f2(dx)}" y1="${f2(dy)}" x2="${f2(ex)}" y2="${f2(ey)}" stroke="#b65c1f" stroke-width="2.6"/>`);
  // Rayons CB, CA, CF et segment CD
  for (const [x, y] of [[bx, by], [ax, ay], [fx, CY]] as const) p.push(`<line x1="${CX}" y1="${CY}" x2="${f2(x)}" y2="${f2(y)}" stroke="#222" stroke-width="1"/>`);
  p.push(`<line x1="${f2(bx)}" y1="${f2(by)}" x2="${f2(dx)}" y2="${f2(dy)}" stroke="#222" stroke-width="0.8" stroke-dasharray="2 2"/>`);
  // Angle α en C
  const ra = 26;
  p.push(`<path d="M ${f2(CX + ra)} ${CY} A ${ra} ${ra} 0 0 0 ${f2(CX + ra * Math.cos(a))} ${f2(CY - ra * Math.sin(a))}" fill="none" stroke="#b65c1f" stroke-width="1.4"/>`);
  p.push(`<text x="${f2(CX + (ra + 9) * Math.cos(a / 2))}" y="${f2(CY - (ra + 9) * Math.sin(a / 2) + 4)}" font-size="13" font-style="italic" ${POLICE} fill="#b65c1f">α</text>`);
  // Angles droits en H et F
  const s = 6;
  p.push(`<path d="M ${f2(hx - s)} ${CY} L ${f2(hx - s)} ${CY - s} L ${f2(hx)} ${CY - s}" fill="none" stroke="#222" stroke-width="0.9"/>`);
  p.push(`<path d="M ${f2(fx - s)} ${CY} L ${f2(fx - s)} ${CY - s} L ${f2(fx)} ${CY - s}" fill="none" stroke="#222" stroke-width="0.9"/>`);
  for (const [x, y] of [[CX, CY], [ax, ay], [bx, by], [hx, CY], [fx, CY], [dx, dy], [ex, ey]] as const) p.push(`<circle cx="${f2(x)}" cy="${f2(y)}" r="2.2" fill="#222"/>`);
  const lab = (t: string, x: number, y: number, ancre = "middle") => p.push(`<text x="${f2(x)}" y="${f2(y)}" font-size="13" ${POLICE} fill="#222" text-anchor="${ancre}">${t}</text>`);
  lab("C", CX - 6, CY + 15, "end");
  lab("A", ax - 4, ay + 15);
  lab("B", bx - 4, by - 7);
  lab("H", hx - 9, CY + 15);
  lab("F", fx + 6, CY - 6, "start");
  lab("D", dx + 7, dy - 2, "start");
  lab("E", ex + 7, ey + 10, "start");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Polygones inscrit et circonscrit">${p.join("")}</svg>`;
}
