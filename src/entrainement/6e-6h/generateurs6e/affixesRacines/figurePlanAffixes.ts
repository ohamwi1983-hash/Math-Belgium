import type { ValeurComplexe } from "../../core6e/affixesRacines.types";

/** Figure du plan complexe (repère orthonormé) des corrigés de `6gen35` (familles B et D), SVG autonome. */

// ============================================================================
// Figure : plan complexe (repère orthonormé), SVG autonome pour le corrigé papier.
// ============================================================================

export const COUL = {
  encre: "var(--ink, #1b1d22)",
  doux: "var(--ink-soft, #5c6370)",
  pale: "var(--ink-faint, #c9ced6)",
  accent: "var(--accent, #b65c1f)",
  accentDoux: "var(--accent-soft, #f4e3d1)",
  bon: "var(--good, #2f7a4f)",
};
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
let compteurFigures = 0;

interface PointPlan {
  v: ValeurComplexe;
  nom: string;
  couleur?: string;
}

export function planComplexeSvg(o: { points: PointPlan[]; polygone?: ValeurComplexe[]; segments?: { de: ValeurComplexe; a: ValeurComplexe; pointilles?: boolean; couleur?: string }[]; libelle: string }): string {
  const id = `pc${++compteurFigures}`;
  const xs = [0, ...o.points.map((q) => q.v.re)];
  const ys = [0, ...o.points.map((q) => q.v.im)];
  // Fenêtre entière avec une case de marge ; les repères « 1 » et « i » restent toujours à l'intérieur.
  const xMin = Math.min(Math.floor(Math.min(...xs)) - 1, -1);
  const xMax = Math.max(Math.ceil(Math.max(...xs)) + 1, 2);
  const yMin = Math.min(Math.floor(Math.min(...ys)) - 1, -1);
  const yMax = Math.max(Math.ceil(Math.max(...ys)) + 1, 2);
  const marge = { g: 18, d: 34, h: 24, b: 18 };
  const unite = Math.min(300 / (xMax - xMin), 260 / (yMax - yMin), 28);
  const L = (xMax - xMin) * unite + marge.g + marge.d;
  const H = (yMax - yMin) * unite + marge.h + marge.b;
  const sx = (x: number) => marge.g + (x - xMin) * unite;
  const sy = (y: number) => H - marge.b - (y - yMin) * unite;
  const f = (v: number) => v.toFixed(1);
  const m: string[] = [];
  m.push(`<defs><marker id="${id}fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COUL.doux}"/></marker></defs>`);
  for (let x = xMin; x <= xMax; x++) m.push(`<line x1="${f(sx(x))}" y1="${f(sy(yMin))}" x2="${f(sx(x))}" y2="${f(sy(yMax))}" stroke="${COUL.pale}" stroke-width="0.6"/>`);
  for (let y = yMin; y <= yMax; y++) m.push(`<line x1="${f(sx(xMin))}" y1="${f(sy(y))}" x2="${f(sx(xMax))}" y2="${f(sy(y))}" stroke="${COUL.pale}" stroke-width="0.6"/>`);
  m.push(
    `<line x1="${f(sx(xMin))}" y1="${f(sy(0))}" x2="${f(sx(xMax) + 12)}" y2="${f(sy(0))}" stroke="${COUL.doux}" stroke-width="1.1" marker-end="url(#${id}fl)"/>`,
    `<line x1="${f(sx(0))}" y1="${f(sy(yMin))}" x2="${f(sx(0))}" y2="${f(sy(yMax) - 12)}" stroke="${COUL.doux}" stroke-width="1.1" marker-end="url(#${id}fl)"/>`,
    `<text x="${f(sx(xMax) + 2)}" y="${f(sy(0) + 14)}" font-size="11" fill="${COUL.doux}" ${POLICE}>Re</text>`,
    `<text x="${f(sx(0) + 5)}" y="${f(sy(yMax) - 4)}" font-size="11" fill="${COUL.doux}" ${POLICE}>Im</text>`,
    `<text x="${f(sx(1))}" y="${f(sy(0) + 13)}" font-size="10" text-anchor="middle" fill="${COUL.doux}" ${POLICE}>1</text>`,
    `<text x="${f(sx(0) - 4)}" y="${f(sy(1) + 4)}" font-size="10" text-anchor="end" fill="${COUL.doux}" ${POLICE}>i</text>`,
  );
  if (o.polygone) m.push(`<polygon points="${o.polygone.map((v) => `${f(sx(v.re))},${f(sy(v.im))}`).join(" ")}" fill="${COUL.accentDoux}" fill-opacity="0.6" stroke="${COUL.accent}" stroke-width="1.6"/>`);
  for (const s of o.segments ?? [])
    m.push(`<line x1="${f(sx(s.de.re))}" y1="${f(sy(s.de.im))}" x2="${f(sx(s.a.re))}" y2="${f(sy(s.a.im))}" stroke="${s.couleur ?? COUL.accent}" stroke-width="1.4"${s.pointilles ? ' stroke-dasharray="4 3"' : ""}/>`);
  const cx = o.points.reduce((t, q) => t + q.v.re, 0) / o.points.length;
  const cy = o.points.reduce((t, q) => t + q.v.im, 0) / o.points.length;
  for (const q of o.points) {
    const couleur = q.couleur ?? COUL.encre;
    const px = sx(q.v.re);
    const py = sy(q.v.im);
    // Étiquette poussée à l'opposé du centre de la figure (jamais sur un côté du polygone).
    const dx = q.v.re >= cx ? 7 : -7;
    const dy = q.v.im >= cy ? -6 : 14;
    m.push(
      `<circle cx="${f(px)}" cy="${f(py)}" r="3.2" fill="${couleur}"/>`,
      `<text x="${f(px + dx)}" y="${f(py + dy)}" font-size="12" font-weight="600" text-anchor="${dx > 0 ? "start" : "end"}" fill="${couleur}" stroke="var(--surface, #ffffff)" stroke-width="3" paint-order="stroke" ${POLICE}>${q.nom}</text>`,
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(L)} ${f(H)}" width="${f(L)}" height="${f(H)}" style="max-width:100%;height:auto" role="img" aria-label="${o.libelle}">${m.join("")}</svg>`;
}

