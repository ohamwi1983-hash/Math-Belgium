import { piTexte, ratTexte, val } from "../moteur5e/trigExact";
import { evaluer } from "../moteur5e/sinusoideExacte";
import { cadre, sinusoide, Phi, T, xColonne, type Cadre, type ExerciceSinusoidePoints } from "../moteur5e/modeleSinusoidePoints";

/**
 * Repère quadrillé de 5gen52 (écran ET papier, une seule source) : colonnes au pas g (T/4 ou T/8),
 * lignes à chaque entier, CHAQUE colonne étiquetée en multiple exact de π (ou en rationnel), sur deux
 * rangées décalées quand il y a plus de 8 colonnes — les points clés tombent tous sur des
 * intersections étiquetées (règle « graphique à LIRE »). Étiquettes en marge (jamais sur la courbe).
 */

export type StylePoint = "eleve" | "juste" | "faux" | "base" | "attendu";

export interface PointFigure {
  i: number;
  y: number;
  style: StylePoint;
}

export interface Geometrie {
  W: number;
  H: number;
  gauche: number;
  haut: number;
  dx: number;
  dy: number;
  cadre: Cadre;
}

const COULEURS: Record<StylePoint, string> = { eleve: "#1d4ed8", juste: "#15803d", faux: "#b91c1c", base: "#475569", attendu: "#c2410c" };
const POLICE = 'font-family="Helvetica, Arial, sans-serif"';
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

export function geometrie(e: ExerciceSinusoidePoints): Geometrie {
  const c = cadre(e);
  const W = 360;
  const gauche = 30;
  const droite = 14;
  const haut = 14;
  const dx = (W - gauche - droite) / c.colonnes;
  const dy = 22;
  const bas = c.colonnes > 8 ? 40 : 26;
  return { W, H: haut + (c.yMax - c.yMin) * dy + bas, gauche, haut, dx, dy, cadre: c };
}

/** Coordonnées SVG d'un point de la grille. */
function px(g: Geometrie, i: number): number {
  return g.gauche + i * g.dx;
}
function py(g: Geometrie, y: number): number {
  return g.haut + (g.cadre.yMax - y) * g.dy;
}

/** Point de la grille le plus proche d'un point du viewBox (clic). */
export function pointDepuisClic(g: Geometrie, vx: number, vy: number): { i: number; y: number } {
  const i = Math.min(g.cadre.colonnes, Math.max(0, Math.round((vx - g.gauche) / g.dx)));
  const y = Math.min(g.cadre.yMax, Math.max(g.cadre.yMin, Math.round(g.cadre.yMax - (vy - g.haut) / g.dy)));
  return { i, y };
}

export interface OptionsFigure {
  /** Courbe tracée : aucune, une période [Φ ; Φ + T], ou toute la fenêtre. */
  courbe: "aucune" | "periode" | "complete";
  points: PointFigure[];
}

export function figureSinusoidePoints(e: ExerciceSinusoidePoints, o: OptionsFigure): string {
  const g = geometrie(e);
  const c = g.cadre;
  const p: string[] = [`<rect x="0" y="0" width="${g.W}" height="${f1(g.H)}" fill="#ffffff"/>`];
  const yBas = py(g, c.yMin);
  const yHaut = py(g, c.yMax);
  for (let i = 0; i <= c.colonnes; i++) p.push(`<line x1="${f1(px(g, i))}" y1="${f1(yHaut)}" x2="${f1(px(g, i))}" y2="${f1(yBas)}" stroke="#cbd5e1" stroke-width="0.8"/>`);
  for (let y = c.yMin; y <= c.yMax; y++) p.push(`<line x1="${f1(px(g, 0))}" y1="${f1(py(g, y))}" x2="${f1(px(g, c.colonnes))}" y2="${f1(py(g, y))}" stroke="#cbd5e1" stroke-width="0.8"/>`);
  // Axes (x = 0 est une colonne : g divise Φ et T/2)
  const i0 = Math.round(-val(c.xMin) / val(c.pas));
  const ax = "#334155";
  p.push(`<line x1="${f1(px(g, 0) - 4)}" y1="${f1(py(g, 0))}" x2="${f1(px(g, c.colonnes) + 9)}" y2="${f1(py(g, 0))}" stroke="${ax}" stroke-width="1.3"/>`);
  p.push(`<path d="M ${f1(px(g, c.colonnes) + 12)} ${f1(py(g, 0))} l -7 -3.5 l 0 7 z" fill="${ax}"/>`);
  p.push(`<line x1="${f1(px(g, i0))}" y1="${f1(yBas + 4)}" x2="${f1(px(g, i0))}" y2="${f1(yHaut - 6)}" stroke="${ax}" stroke-width="1.3"/>`);
  p.push(`<path d="M ${f1(px(g, i0))} ${f1(yHaut - 10)} l -3.5 7 l 7 0 z" fill="${ax}"/>`);
  p.push(`<text x="${f1(px(g, c.colonnes) + 4)}" y="${f1(py(g, 0) - 6)}" font-size="11" font-style="italic" ${POLICE} fill="${ax}">x</text>`);
  p.push(`<text x="${f1(px(g, i0) + 6)}" y="${f1(yHaut - 2)}" font-size="11" font-style="italic" ${POLICE} fill="${ax}">y</text>`);
  // Étiquettes : ordonnées à gauche, abscisses sous le cadre (deux rangées si > 8 colonnes)
  for (let y = c.yMin; y <= c.yMax; y++) p.push(`<text x="${f1(g.gauche - 6)}" y="${f1(py(g, y) + 3.5)}" font-size="10" text-anchor="end" ${POLICE} fill="${ax}">${y < 0 ? `−${-y}` : y}</text>`);
  const decale = c.colonnes > 8;
  for (let i = 0; i <= c.colonnes; i++) {
    const x = xColonne(c, i);
    const t = e.enPi ? piTexte(x) : ratTexte(x);
    const yt = yBas + 13 + (decale && i % 2 === 1 ? 13 : 0);
    if (decale && i % 2 === 1) p.push(`<line x1="${f1(px(g, i))}" y1="${f1(yBas)}" x2="${f1(px(g, i))}" y2="${f1(yt - 9)}" stroke="#cbd5e1" stroke-width="0.8"/>`);
    p.push(`<text x="${f1(px(g, i))}" y="${f1(yt)}" font-size="9.5" text-anchor="middle" ${POLICE} fill="${ax}">${t}</text>`);
  }
  // Courbe
  if (o.courbe !== "aucune") {
    const s = sinusoide(e);
    const deb = o.courbe === "periode" ? val(Phi(e)) : val(c.xMin);
    const fin = o.courbe === "periode" ? val(Phi(e)) + val(T(e)) : val(xColonne(c, c.colonnes));
    const pts: string[] = [];
    const n = 160;
    for (let k = 0; k <= n; k++) {
      const xv = deb + ((fin - deb) * k) / n;
      const xr = e.enPi ? xv * Math.PI : xv;
      const iF = (xv - val(c.xMin)) / val(c.pas);
      pts.push(`${f1(g.gauche + iF * g.dx)},${f1(py(g, evaluer(s, xr)))}`);
    }
    p.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="#1971c2" stroke-width="2"/>`);
  }
  for (const pt of o.points) {
    const cx = px(g, pt.i);
    const cy = py(g, pt.y);
    const col = COULEURS[pt.style];
    if (pt.style === "attendu") p.push(`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="6" fill="none" stroke="${col}" stroke-width="2"/>`);
    else p.push(`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="5" fill="${col}" stroke="#ffffff" stroke-width="1.2"/>`);
    if (pt.style === "faux") p.push(`<path d="M ${f1(cx - 3)} ${f1(cy - 3)} L ${f1(cx + 3)} ${f1(cy + 3)} M ${f1(cx - 3)} ${f1(cy + 3)} L ${f1(cx + 3)} ${f1(cy - 3)}" stroke="#ffffff" stroke-width="1.6"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${g.W}" height="${Math.round(g.H)}" viewBox="0 0 ${g.W} ${f1(g.H)}" role="img" aria-label="Repère quadrillé pour construire la sinusoïde">${p.join("")}</svg>`;
}
