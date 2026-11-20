import { piTexte, val, type Rat } from "../moteur5e/trigExact";
import { evaluer, type SinusoideExacte } from "../moteur5e/sinusoideExacte";
import { xColonne, type FenetreCourbes } from "../moteur5e/modeleAssocierCourbes";

/**
 * Courbe de 5gen53 sur le quadrillage commun aux quatre courbes (écran ET papier) : colonnes au pas g
 * (pgcd des quarts de période et des décalages), lignes à chaque entier ; CHAQUE colonne étiquetée en
 * multiple exact de π (deux rangées décalées au-delà de 8 colonnes), ordonnées entières à gauche —
 * maximum, minimum, ligne moyenne, période et décalage se lisent sur des lignes de la grille.
 */

const POLICE = 'font-family="Helvetica, Arial, sans-serif"';
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

export interface Repere {
  x: Rat;
  y: number;
}

export function figureCourbe(s: SinusoideExacte, fen: FenetreCourbes, titre: string, reperes: Repere[] = []): string {
  const W = 340;
  const gauche = 28;
  const droite = 14;
  const haut = 24;
  const dx = (W - gauche - droite) / fen.colonnes;
  const dy = 18;
  const decale = fen.colonnes > 8;
  const bas = decale ? 38 : 24;
  const H = haut + (fen.yMax - fen.yMin) * dy + bas;
  const px = (i: number) => gauche + i * dx;
  const py = (y: number) => haut + (fen.yMax - y) * dy;
  const ax = "#334155";
  const p: string[] = [`<rect x="0" y="0" width="${W}" height="${f1(H)}" fill="#ffffff"/>`];
  p.push(`<text x="${gauche}" y="14" font-size="12" font-weight="bold" ${POLICE} fill="${ax}">${titre}</text>`);
  for (let i = 0; i <= fen.colonnes; i++) p.push(`<line x1="${f1(px(i))}" y1="${f1(py(fen.yMax))}" x2="${f1(px(i))}" y2="${f1(py(fen.yMin))}" stroke="#cbd5e1" stroke-width="0.8"/>`);
  for (let y = fen.yMin; y <= fen.yMax; y++) p.push(`<line x1="${f1(px(0))}" y1="${f1(py(y))}" x2="${f1(px(fen.colonnes))}" y2="${f1(py(y))}" stroke="#cbd5e1" stroke-width="0.8"/>`);
  const i0 = Math.round(-val(fen.xMin) / val(fen.pas));
  p.push(`<line x1="${f1(px(0) - 4)}" y1="${f1(py(0))}" x2="${f1(px(fen.colonnes) + 9)}" y2="${f1(py(0))}" stroke="${ax}" stroke-width="1.3"/>`);
  p.push(`<path d="M ${f1(px(fen.colonnes) + 12)} ${f1(py(0))} l -7 -3.5 l 0 7 z" fill="${ax}"/>`);
  p.push(`<line x1="${f1(px(i0))}" y1="${f1(py(fen.yMin) + 4)}" x2="${f1(px(i0))}" y2="${f1(py(fen.yMax) - 6)}" stroke="${ax}" stroke-width="1.3"/>`);
  p.push(`<path d="M ${f1(px(i0))} ${f1(py(fen.yMax) - 10)} l -3.5 7 l 7 0 z" fill="${ax}"/>`);
  for (let y = fen.yMin; y <= fen.yMax; y++) p.push(`<text x="${f1(gauche - 6)}" y="${f1(py(y) + 3.5)}" font-size="10" text-anchor="end" ${POLICE} fill="${ax}">${y < 0 ? `−${-y}` : y}</text>`);
  for (let i = 0; i <= fen.colonnes; i++) {
    const yt = py(fen.yMin) + 13 + (decale && i % 2 === 1 ? 13 : 0);
    if (decale && i % 2 === 1) p.push(`<line x1="${f1(px(i))}" y1="${f1(py(fen.yMin))}" x2="${f1(px(i))}" y2="${f1(yt - 9)}" stroke="#cbd5e1" stroke-width="0.8"/>`);
    p.push(`<text x="${f1(px(i))}" y="${f1(yt)}" font-size="9.5" text-anchor="middle" ${POLICE} fill="${ax}">${piTexte(xColonne(fen, i))}</text>`);
  }
  const x0 = val(fen.xMin);
  const x1 = val(xColonne(fen, fen.colonnes));
  const pts: string[] = [];
  for (let k = 0; k <= 240; k++) {
    const xv = x0 + ((x1 - x0) * k) / 240;
    pts.push(`${f1(gauche + ((xv - x0) / val(fen.pas)) * dx)},${f1(py(evaluer(s, xv * Math.PI)))}`);
  }
  p.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="#1971c2" stroke-width="2"/>`);
  for (const r of reperes) {
    const i = (val(r.x) - x0) / val(fen.pas);
    p.push(`<circle cx="${f1(px(i))}" cy="${f1(py(r.y))}" r="4.5" fill="#c2410c" stroke="#ffffff" stroke-width="1.2"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Math.round(H)}" viewBox="0 0 ${W} ${f1(H)}" role="img" aria-label="${titre}">${p.join("")}</svg>`;
}
