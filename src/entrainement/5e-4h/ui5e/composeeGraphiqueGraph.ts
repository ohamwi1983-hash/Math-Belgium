import type { CourbeGraphique, PointGraphique } from "../core5e/composeeGraphique.types";
import { X_MAX_CADRE, X_MIN_CADRE, Y_MAX_CADRE, Y_MIN_CADRE } from "../generateurs5e/composeeGraphique/courbes";

/** Segments consécutifs de la ligne brisée — un tableau de paires [pointA,pointB]. */
export function segmentsCourbe(courbe: CourbeGraphique): [PointGraphique, PointGraphique][] {
  const segments: [PointGraphique, PointGraphique][] = [];
  for (let i = 0; i < courbe.points.length - 1; i++) {
    segments.push([courbe.points[i], courbe.points[i + 1]]);
  }
  return segments;
}

export function extremitesCourbe(courbe: CourbeGraphique): [PointGraphique, PointGraphique] {
  return [courbe.points[0], courbe.points[courbe.points.length - 1]];
}

/** Nombre avec le signe moins typographique (« −3 », jamais « -3 »). */
export function nombreTypo(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

export interface CouleursGrapheComposee {
  /** Courbe elle-même et ses deux extrémités. */
  courbe: string;
  /** Quadrillage (une ligne par unité). */
  grille: string;
  /** Axes, flèches et graduations. */
  axe: string;
  /** Point révélé par l'aide et ses pointillés. */
  aide: string;
  /** Fond du disque blanc derrière les étiquettes (lisibilité sur le quadrillage). */
  fond: string;
}

/** Couleurs de l'écran : jetons du thème (clair et sombre). */
export const COULEURS_ECRAN_F: CouleursGrapheComposee = {
  courbe: "var(--sky, #2f6fb0)",
  grille: "var(--line-soft, #dfe7ec)",
  axe: "var(--ink-soft, #51626f)",
  aide: "var(--plan, #5b4ea3)",
  fond: "var(--surface, #ffffff)",
};
export const COULEURS_ECRAN_G: CouleursGrapheComposee = { ...COULEURS_ECRAN_F, courbe: "var(--accent, #b65c1f)" };

export interface OptionsGrapheComposee {
  couleurs: CouleursGrapheComposee;
  /** Point à révéler (aide niveau 2) : nœud réel de la courbe, avec pointillés vers les deux axes. */
  pointRevele?: PointGraphique | null;
  /** Nom lu par les lecteurs d'écran (« Graphe de f »). */
  titre?: string;
}

const COTE = 340;
const MARGE = 20;
const UNITE = (COTE - 2 * MARGE) / (X_MAX_CADRE - X_MIN_CADRE);

function px(x: number): number {
  return MARGE + (x - X_MIN_CADRE) * UNITE;
}
function py(y: number): number {
  return MARGE + (Y_MAX_CADRE - y) * UNITE;
}
function f2(v: number): string {
  return v.toFixed(2);
}

/**
 * Graphe SVG autonome (chaîne) d'une courbe de 5gen4 — MÊME rendu à l'écran et sur papier (la figure
 * du corrigé pourra reprendre cette fonction avec des couleurs en dur). Décisions de l'audit du
 * chapitre 1 de 5e (point 29, décision G) :
 * - cadre FIXE [−8 ; 8]², repère orthonormé carré, une ligne de quadrillage PAR UNITÉ : chaque nœud
 *   de la ligne brisée (abscisse et ordonnée entières) tombe exactement sur une intersection ;
 * - segments DROITS entre nœuds (l'ancienne spline de Catmull-Rom dépassait entre les nœuds, avec de
 *   faux extremums et un passage hors cadre) ;
 * - points pleins aux deux extrémités du domaine ;
 * - graduations −8…8 de 2 en 2 avec « − » typographique, posées le long des axes et jamais rognées
 *   (marge réservée tout autour du cadre).
 */
export function svgGrapheComposee(courbe: CourbeGraphique, options: OptionsGrapheComposee): string {
  const { couleurs, pointRevele, titre } = options;
  const parties: string[] = [];
  const x0 = px(0);
  const y0 = py(0);

  // Quadrillage : une ligne par unité.
  for (let k = X_MIN_CADRE; k <= X_MAX_CADRE; k++) {
    parties.push(`<line x1="${f2(px(k))}" y1="${f2(py(Y_MIN_CADRE))}" x2="${f2(px(k))}" y2="${f2(py(Y_MAX_CADRE))}" stroke="${couleurs.grille}" stroke-width="1"/>`);
  }
  for (let k = Y_MIN_CADRE; k <= Y_MAX_CADRE; k++) {
    parties.push(`<line x1="${f2(px(X_MIN_CADRE))}" y1="${f2(py(k))}" x2="${f2(px(X_MAX_CADRE))}" y2="${f2(py(k))}" stroke="${couleurs.grille}" stroke-width="1"/>`);
  }

  // Axes fléchés.
  const xDebut = px(X_MIN_CADRE) - 6;
  const xFin = px(X_MAX_CADRE) + 10;
  const yBas = py(Y_MIN_CADRE) + 6;
  const yHaut = py(Y_MAX_CADRE) - 10;
  parties.push(`<line x1="${f2(xDebut)}" y1="${f2(y0)}" x2="${f2(xFin)}" y2="${f2(y0)}" stroke="${couleurs.axe}" stroke-width="1.4"/>`);
  parties.push(`<path d="M${f2(xFin + 2)},${f2(y0)} L${f2(xFin - 6)},${f2(y0 - 4)} L${f2(xFin - 6)},${f2(y0 + 4)} Z" fill="${couleurs.axe}"/>`);
  parties.push(`<line x1="${f2(x0)}" y1="${f2(yBas)}" x2="${f2(x0)}" y2="${f2(yHaut)}" stroke="${couleurs.axe}" stroke-width="1.4"/>`);
  parties.push(`<path d="M${f2(x0)},${f2(yHaut - 2)} L${f2(x0 - 4)},${f2(yHaut + 6)} L${f2(x0 + 4)},${f2(yHaut + 6)} Z" fill="${couleurs.axe}"/>`);

  // Graduations de 2 en 2 (« − » typographique), le long des axes.
  const styleTexte = `font-size="11" font-family="inherit" fill="${couleurs.axe}"`;
  for (let k = X_MIN_CADRE; k <= X_MAX_CADRE; k += 2) {
    if (k === 0) continue;
    parties.push(`<line x1="${f2(px(k))}" y1="${f2(y0 - 3)}" x2="${f2(px(k))}" y2="${f2(y0 + 3)}" stroke="${couleurs.axe}" stroke-width="1.2"/>`);
    parties.push(`<text x="${f2(px(k))}" y="${f2(y0 + 14)}" text-anchor="middle" ${styleTexte} paint-order="stroke" stroke="${couleurs.fond}" stroke-width="3">${nombreTypo(k)}</text>`);
  }
  for (let k = Y_MIN_CADRE; k <= Y_MAX_CADRE; k += 2) {
    if (k === 0) continue;
    parties.push(`<line x1="${f2(x0 - 3)}" y1="${f2(py(k))}" x2="${f2(x0 + 3)}" y2="${f2(py(k))}" stroke="${couleurs.axe}" stroke-width="1.2"/>`);
    parties.push(`<text x="${f2(x0 - 5)}" y="${f2(py(k) + 4)}" text-anchor="end" ${styleTexte} paint-order="stroke" stroke="${couleurs.fond}" stroke-width="3">${nombreTypo(k)}</text>`);
  }
  parties.push(`<text x="${f2(x0 - 5)}" y="${f2(y0 + 14)}" text-anchor="end" ${styleTexte}>0</text>`);
  parties.push(`<text x="${f2(xFin - 2)}" y="${f2(y0 - 7)}" text-anchor="end" font-size="12" font-style="italic" fill="${couleurs.axe}">x</text>`);
  parties.push(`<text x="${f2(x0 + 7)}" y="${f2(yHaut + 6)}" font-size="12" font-style="italic" fill="${couleurs.axe}">y</text>`);

  // Courbe : segments droits entre nœuds entiers, points pleins aux extrémités.
  const points = courbe.points.map((p) => `${f2(px(p.x))},${f2(py(p.y))}`).join(" ");
  parties.push(`<polyline points="${points}" fill="none" stroke="${couleurs.courbe}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`);
  const [debut, fin] = extremitesCourbe(courbe);
  for (const p of [debut, fin]) parties.push(`<circle cx="${f2(px(p.x))}" cy="${f2(py(p.y))}" r="4.2" fill="${couleurs.courbe}"/>`);

  // Aide niveau 2 : point révélé, pointillés vers les axes.
  if (pointRevele) {
    const rx = px(pointRevele.x);
    const ry = py(pointRevele.y);
    parties.push(`<line x1="${f2(rx)}" y1="${f2(ry)}" x2="${f2(rx)}" y2="${f2(y0)}" stroke="${couleurs.aide}" stroke-width="1.6" stroke-dasharray="4 3"/>`);
    parties.push(`<line x1="${f2(rx)}" y1="${f2(ry)}" x2="${f2(x0)}" y2="${f2(ry)}" stroke="${couleurs.aide}" stroke-width="1.6" stroke-dasharray="4 3"/>`);
    parties.push(`<circle cx="${f2(rx)}" cy="${f2(ry)}" r="4.6" fill="${couleurs.aide}"/>`);
  }

  const etiquette = titre ? ` role="img" aria-label="${titre}"` : "";
  return `<svg viewBox="0 0 ${COTE} ${COTE}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block"${etiquette}>${parties.join("")}</svg>`;
}
