import type { ExerciceDeterminerParametresLogarithme } from "../../core6e/determinerParametresLogarithme.types";
import { abscisseSecondeMarque, cadreGraphe, evaluerF, ordonneeSecondeMarque, segmentTangente } from "../../ui6e/formatDeterminerParametresLogarithme";

/**
 * Figure SVG autonome de `6gen18` pour la feuille d'évaluation (pipeline HTML) — même cadre et mêmes
 * marques que le graphe interactif (`components6e/GrapheParametresLogarithme.tsx`, via les helpers
 * partagés de `ui6e/formatDeterminerParametresLogarithme.ts`), quadrillage FIXE d'unité 1 et
 * étiquettes entières (jamais un pas « rond » de 2 ou 0,5 qui empêcherait la lecture exacte).
 */

const LARGEUR = 280;
const HAUTEUR = 230;
const MARGE = 18;
const COULEUR_GRILLE = "#dee2e6";
const COULEUR_AXE = "#495057";
const COULEUR_COURBE = "#1971c2";
const COULEUR_TANGENTE = "#e8590c";
const COULEUR_POINT = "#2b2d42";

export function construireSvgParametresLogarithme(exercice: ExerciceDeterminerParametresLogarithme): string {
  const { xMin, xMax, yMin, yMax } = cadreGraphe(exercice);
  const sx = (x: number) => MARGE + ((x - xMin) / (xMax - xMin)) * (LARGEUR - 2 * MARGE);
  const sy = (y: number) => MARGE + ((yMax - y) / (yMax - yMin)) * (HAUTEUR - 2 * MARGE);
  const pasEtiquetteY = yMax - yMin > 14 ? 2 : 1;
  const morceaux: string[] = [`<rect x="0" y="0" width="${LARGEUR}" height="${HAUTEUR}" fill="#ffffff"/>`];

  for (let x = Math.ceil(xMin); x <= xMax; x++) {
    morceaux.push(`<line x1="${sx(x).toFixed(1)}" y1="${MARGE}" x2="${sx(x).toFixed(1)}" y2="${HAUTEUR - MARGE}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (x !== 0) morceaux.push(`<text x="${sx(x).toFixed(1)}" y="${(sy(0) + 11).toFixed(1)}" font-size="8" text-anchor="middle" fill="${COULEUR_AXE}">${x < 0 ? "−" : ""}${Math.abs(x)}</text>`);
  }
  for (let y = Math.ceil(yMin); y <= yMax; y++) {
    morceaux.push(`<line x1="${MARGE}" y1="${sy(y).toFixed(1)}" x2="${LARGEUR - MARGE}" y2="${sy(y).toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (y !== 0 && y % pasEtiquetteY === 0) morceaux.push(`<text x="${(sx(0) - 4).toFixed(1)}" y="${(sy(y) + 3).toFixed(1)}" font-size="8" text-anchor="end" fill="${COULEUR_AXE}">${y < 0 ? "−" : ""}${Math.abs(y)}</text>`);
  }
  morceaux.push(`<line x1="${MARGE}" y1="${sy(0).toFixed(1)}" x2="${LARGEUR - MARGE}" y2="${sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`);
  morceaux.push(`<line x1="${sx(0).toFixed(1)}" y1="${MARGE}" x2="${sx(0).toFixed(1)}" y2="${HAUTEUR - MARGE}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`);

  const points: string[] = [];
  for (let i = 0; i <= 400; i++) {
    const x = 0.005 + ((xMax - 0.005) * i) / 400;
    const y = evaluerF(exercice, x);
    // f est monotone : les points hors cadre ne se trouvent qu'au voisinage de 0 (ou en bout de
    // fenêtre), jamais au milieu — une seule polyligne contiguë suffit.
    if (y < yMin || y > yMax) continue;
    points.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
  }
  morceaux.push(`<polyline points="${points.join(" ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2"/>`);

  if (exercice.variante === "pente") {
    const [[x1, y1], [x2, y2]] = segmentTangente(exercice);
    morceaux.push(`<line x1="${sx(x1).toFixed(1)}" y1="${sy(y1).toFixed(1)}" x2="${sx(x2).toFixed(1)}" y2="${sy(y2).toFixed(1)}" stroke="${COULEUR_TANGENTE}" stroke-width="1.8"/>`);
  } else {
    const x2 = abscisseSecondeMarque(exercice);
    const y2 = ordonneeSecondeMarque(exercice);
    morceaux.push(`<line x1="${sx(x2).toFixed(1)}" y1="${sy(0).toFixed(1)}" x2="${sx(x2).toFixed(1)}" y2="${sy(y2).toFixed(1)}" stroke="${COULEUR_POINT}" stroke-width="1" stroke-dasharray="3 3"/>`);
    morceaux.push(`<text x="${sx(x2).toFixed(1)}" y="${(sy(0) + (y2 >= 0 ? 20 : -6)).toFixed(1)}" font-size="9" font-style="italic" text-anchor="middle" fill="${COULEUR_POINT}">${exercice.variante === "pointE" ? "e" : "e²"}</text>`);
    morceaux.push(`<circle cx="${sx(x2).toFixed(1)}" cy="${sy(y2).toFixed(1)}" r="3" fill="${COULEUR_POINT}"/>`);
    morceaux.push(`<text x="${(sx(x2) + 5).toFixed(1)}" y="${(sy(y2) - 5).toFixed(1)}" font-size="10" font-weight="bold" fill="${COULEUR_POINT}">${exercice.lettrePoint2}</text>`);
  }
  morceaux.push(`<circle cx="${sx(1).toFixed(1)}" cy="${sy(exercice.a).toFixed(1)}" r="3" fill="${COULEUR_POINT}"/>`);
  morceaux.push(`<text x="${(sx(1) - 12).toFixed(1)}" y="${(sy(exercice.a) - 5).toFixed(1)}" font-size="10" font-weight="bold" fill="${COULEUR_POINT}">${exercice.lettrePoint1}</text>`);
  morceaux.push(`<rect x="0.5" y="0.5" width="${LARGEUR - 1}" height="${HAUTEUR - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`);

  return `<svg class="graphe-cyclo" width="${LARGEUR}" height="${HAUTEUR}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" xmlns="http://www.w3.org/2000/svg">${morceaux.join("")}</svg>`;
}
