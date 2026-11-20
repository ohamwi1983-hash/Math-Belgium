import type { CourbeEntiere, ExerciceComposeeDiagonale } from "../core5e/composeeDiagonale";
import { FENETRE, finCourbe } from "../core5e/composeeDiagonale";

/**
 * Figure de `5gen63` : Cf, Cg et la droite y = x dans le MÊME repère — même échelle en x et en y (la
 * diagonale est à 45°), quadrillage d'une unité, graduations entières, extrémités pleines (comprises)
 * ou creuses (exclues). Chaîne SVG autonome, la même à l'écran, sur papier (`enteteHtml`) et dans le
 * corrigé (`figureHtml`, avec la construction du report). Options de construction :
 * - `report` : segment horizontal (a ; v) → (v ; v) jusqu'à la diagonale ;
 * - `verticale` : droite x = v en entier (aide de niveau 2 : on ne marque pas l'intersection) ;
 * - `complete` : construction entière annotée (corrigé).
 */

export interface OptionsFigureDiagonale {
  carreau: number;
  police: number;
  report?: boolean;
  verticale?: boolean;
  complete?: boolean;
}

const MARGE = 14;
const GRILLE = "#d8dee6";
const AXE = "#495057";
const COULEUR_F = "#1971c2";
const COULEUR_G = "#2f9e44";
const DIAGONALE = "#868e96";
const CONSTRUCTION = "#e8590c";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';
const f1 = (v: number) => v.toFixed(1);
const nombre = (v: number) => (v < 0 ? `−${Math.abs(v)}` : String(v));

/** Étiquette « Cf » / « Cg » (C italique, indice). */
function nomCourbe(x: number, y: number, lettre: string, couleur: string, p: number, ancre: string): string {
  return `<text x="${f1(x)}" y="${f1(y)}" font-size="${(p * 1.25).toFixed(1)}" font-weight="bold" text-anchor="${ancre}" fill="${couleur}" ${POLICE} ${HALO}><tspan font-style="italic" font-family="Times New Roman, serif">C</tspan><tspan font-size="${(p * 0.95).toFixed(1)}" dy="${(p * 0.3).toFixed(1)}" font-style="italic" font-family="Times New Roman, serif">${lettre}</tspan></text>`;
}

export function figureDiagonaleSvg(e: ExerciceComposeeDiagonale, o: OptionsFigureDiagonale): string {
  const { min, max } = FENETRE;
  const n = max - min;
  const c = o.carreau;
  const p = o.police;
  const T = n * c + 2 * MARGE;
  const sx = (x: number) => MARGE + (x - min) * c;
  const sy = (y: number) => MARGE + (max - y) * c;
  const s: string[] = [];
  s.push(`<rect x="0" y="0" width="${T}" height="${T}" fill="#ffffff"/>`);
  for (let k = min; k <= max; k++) {
    s.push(`<line x1="${f1(sx(k))}" y1="${MARGE}" x2="${f1(sx(k))}" y2="${T - MARGE}" stroke="${GRILLE}" stroke-width="1"/>`);
    s.push(`<line x1="${MARGE}" y1="${f1(sy(k))}" x2="${T - MARGE}" y2="${f1(sy(k))}" stroke="${GRILLE}" stroke-width="1"/>`);
  }
  s.push(`<line x1="${MARGE}" y1="${f1(sy(0))}" x2="${T - MARGE}" y2="${f1(sy(0))}" stroke="${AXE}" stroke-width="1.4"/>`);
  s.push(`<line x1="${f1(sx(0))}" y1="${MARGE}" x2="${f1(sx(0))}" y2="${T - MARGE}" stroke="${AXE}" stroke-width="1.4"/>`);
  // Flèches et noms des axes.
  s.push(`<path d="M ${T - MARGE + 6},${f1(sy(0))} l -7,-4 l 0,8 z" fill="${AXE}"/>`);
  s.push(`<path d="M ${f1(sx(0))},${MARGE - 6} l -4,7 l 8,0 z" fill="${AXE}"/>`);
  s.push(`<text x="${T - MARGE - 2}" y="${f1(sy(0) - 5)}" font-size="${p}" font-style="italic" text-anchor="end" fill="${AXE}" font-family="Times New Roman, serif" ${HALO}>x</text>`);
  s.push(`<text x="${f1(sx(0) + 6)}" y="${MARGE + p * 0.6}" font-size="${p}" font-style="italic" fill="${AXE}" font-family="Times New Roman, serif" ${HALO}>y</text>`);
  // Graduations (toutes les unités si la place le permet, sinon de 2 en 2).
  const pas = c >= 1.8 * p ? 1 : 2;
  for (let k = min + 1; k < max; k++) {
    if (k === 0 || k % pas !== 0) continue;
    s.push(`<text x="${f1(sx(k))}" y="${f1(sy(0) + p + 2)}" font-size="${p}" text-anchor="middle" fill="${AXE}" ${POLICE} ${HALO}>${nombre(k)}</text>`);
    s.push(`<text x="${f1(sx(0) - 3)}" y="${f1(sy(k) + p / 2.8)}" font-size="${p}" text-anchor="end" fill="${AXE}" ${POLICE} ${HALO}>${nombre(k)}</text>`);
  }
  s.push(`<text x="${f1(sx(0) - 3)}" y="${f1(sy(0) + p + 2)}" font-size="${p}" text-anchor="end" fill="${AXE}" ${POLICE} ${HALO}>0</text>`);
  // Diagonale y = x.
  s.push(`<line x1="${f1(sx(min))}" y1="${f1(sy(min))}" x2="${f1(sx(max))}" y2="${f1(sy(max))}" stroke="${DIAGONALE}" stroke-width="1.6" stroke-dasharray="6 4"/>`);
  s.push(`<text x="${f1(sx(max) - 4)}" y="${f1(sy(max) + p * 1.9)}" font-size="${p}" text-anchor="end" fill="${DIAGONALE}" ${POLICE} ${HALO}><tspan font-style="italic" font-family="Times New Roman, serif">y</tspan> = <tspan font-style="italic" font-family="Times New Roman, serif">x</tspan></text>`);
  // Construction (sous les courbes).
  const dash = `stroke="${CONSTRUCTION}" stroke-width="1.8" stroke-dasharray="5 3"`;
  if (o.complete) s.push(`<line x1="${f1(sx(e.a))}" y1="${f1(sy(0))}" x2="${f1(sx(e.a))}" y2="${f1(sy(e.v))}" ${dash}/>`);
  if (o.report || o.complete) s.push(`<line x1="${f1(sx(e.a))}" y1="${f1(sy(e.v))}" x2="${f1(sx(e.v))}" y2="${f1(sy(e.v))}" ${dash}/>`);
  if (o.verticale) s.push(`<line x1="${f1(sx(e.v))}" y1="${MARGE}" x2="${f1(sx(e.v))}" y2="${T - MARGE}" stroke="${CONSTRUCTION}" stroke-width="1.4" stroke-dasharray="3 3" opacity="0.85"/>`);
  if (o.complete) {
    const yFin = e.w ?? 0;
    s.push(`<line x1="${f1(sx(e.v))}" y1="${f1(sy(e.v))}" x2="${f1(sx(e.v))}" y2="${f1(sy(yFin))}" ${dash}/>`);
  }
  // Courbes.
  const trace = (k: CourbeEntiere, couleur: string) => {
    const pts = k.valeurs.map((y, i) => `${i ? "L" : "M"} ${f1(sx(k.debut + i))},${f1(sy(y))}`).join(" ");
    s.push(`<path d="${pts}" fill="none" stroke="${couleur}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`);
    const fin = finCourbe(k);
    for (const [x, ouverte] of [
      [k.debut, k.ouverteG],
      [fin, k.ouverteD],
    ] as const) {
      const y = k.valeurs[x - k.debut];
      s.push(`<circle cx="${f1(sx(x))}" cy="${f1(sy(y))}" r="${(c * 0.16 + 1.5).toFixed(1)}" fill="${ouverte ? "#ffffff" : couleur}" stroke="${couleur}" stroke-width="2"/>`);
    }
  };
  trace(e.g, COULEUR_G);
  trace(e.f, COULEUR_F);
  // Noms des courbes près de leur extrémité droite (au-dessus ou au-dessous selon la place).
  const placer = (k: CourbeEntiere, lettre: string, couleur: string, autre: CourbeEntiere) => {
    const fin = finCourbe(k);
    const y = k.valeurs[k.valeurs.length - 1];
    const yAutre = fin >= autre.debut && fin <= finCourbe(autre) ? autre.valeurs[fin - autre.debut] : null;
    const dessous = y >= max - 1 || (yAutre !== null && yAutre > y && yAutre - y <= 2);
    const droite = fin <= max - 2;
    s.push(nomCourbe(sx(fin) + (droite ? 8 : -8), sy(y) + (dessous ? p * 1.5 : -p * 0.5), lettre, couleur, p, droite ? "start" : "end"));
  };
  placer(e.f, "f", COULEUR_F, e.g);
  placer(e.g, "g", COULEUR_G, e.f);
  if (o.complete) {
    const pt = (x: number, y: number, txt: string, dessous: boolean) =>
      s.push(`<circle cx="${f1(sx(x))}" cy="${f1(sy(y))}" r="3.4" fill="${CONSTRUCTION}"/><text x="${f1(sx(x) + 6)}" y="${f1(sy(y) + (dessous ? p * 1.3 : -5))}" font-size="${p}" font-weight="bold" fill="${CONSTRUCTION}" ${POLICE} ${HALO}>${txt}</text>`);
    pt(e.a, e.v, `(${nombre(e.a)} ; ${nombre(e.v)})`, false);
    pt(e.v, e.v, `(${nombre(e.v)} ; ${nombre(e.v)})`, true);
    if (e.w !== null) pt(e.v, e.w, `(${nombre(e.v)} ; ${nombre(e.w)})`, e.w < e.v);
  }
  s.push(`<rect x="0.5" y="0.5" width="${T - 1}" height="${T - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`);
  return `<svg class="graphe-diagonale" width="${T}" height="${T}" viewBox="0 0 ${T} ${T}" xmlns="http://www.w3.org/2000/svg">${s.join("")}</svg>`;
}

/** Figure de l'écran (largeur maximale fixée par l'appli). */
export const figureEcran = (e: ExerciceComposeeDiagonale, o: Partial<OptionsFigureDiagonale> = {}) => figureDiagonaleSvg(e, { carreau: 28, police: 11, ...o });
/** Figure papier : carreaux de 5 mm environ (≈ 19 px). */
export const figurePapier = (e: ExerciceComposeeDiagonale, o: Partial<OptionsFigureDiagonale> = {}) => figureDiagonaleSvg(e, { carreau: 19, police: 10, ...o });
