import type { ExerciceEtudeCompletePipeline } from "../../core5e/etudeComplete.types";
import { construireSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import { formatPenteOrdonnee } from "../../ui5e/formatEtudeComplete";
import { polyEval } from "./poly";

/**
 * Graphe du corrigé de 5gen24 (courbe, asymptotes en pointillés, point retiré, point de recoupement)
 * — sorti de `exportEvaluation.ts` (qui importe `docx`) pour être partagé avec le corrigé détaillé
 * (`corrigeDetaille.ts`, importé par `App5gen24.tsx`).
 */

/** Nombre écrit dans une phrase : vrai signe moins. */
function nombreTexte(v: number): string {
  return `${v}`.replace("-", "−");
}

// ============================================================================
// Graphe du corrigé — courbe, asymptotes en pointillés, point retiré, point de recoupement.
// ============================================================================

const LARGEUR_SVG = 440;
const HAUTEUR_SVG = 300;
/** Même marge que `export/svgGraph.ts` (constante non exportée) : repère identique pour les ajouts. */
const MARGE_SVG = 10;
const COULEUR_COURBE = "#1971c2";
const COULEUR_ASYMPTOTE = "#d9480f";

function evaluerF(exercice: ExerciceEtudeCompletePipeline, x: number): number {
  return polyEval(exercice.coeffsN, x) / polyEval(exercice.coeffsD, x);
}

function fenetre(exercice: ExerciceEtudeCompletePipeline): ViewBoxSvg {
  const abscisses = [...exercice.exclusions.map((e) => e.position), ...(exercice.casSpecial ? [exercice.casSpecial.x] : []), 0];
  let xMin = Math.min(...abscisses) - 4;
  let xMax = Math.max(...abscisses) + 4;
  if (xMax - xMin < 12) {
    const c = (xMin + xMax) / 2;
    xMin = c - 6;
    xMax = c + 6;
  }
  const ys: number[] = [];
  for (let i = 0; i <= 400; i++) {
    const x = xMin + ((xMax - xMin) * i) / 400;
    if (exercice.exclusions.some((e) => Math.abs(x - e.position) < 0.4)) continue;
    const y = evaluerF(exercice, x);
    if (Number.isFinite(y)) ys.push(y);
  }
  ys.sort((a, b) => a - b);
  const q = (p: number) => ys[Math.min(ys.length - 1, Math.max(0, Math.floor(p * (ys.length - 1))))] ?? 0;
  const reperes = [q(0.12), q(0.88), 0];
  if (exercice.infini.type === "horizontale") reperes.push(exercice.infini.limite);
  if (exercice.casSpecial) reperes.push(exercice.casSpecial.y);
  const pv = exercice.exclusions.find((e) => e.type === "pointVide");
  if (pv && pv.valeurPointVide !== undefined) reperes.push(pv.valeurPointVide);
  let yMin = Math.min(...reperes);
  let yMax = Math.max(...reperes);
  if (yMax - yMin < 8) {
    const c = (yMin + yMax) / 2;
    yMin = c - 4;
    yMax = c + 4;
  }
  if (yMax - yMin > 40) {
    const c = Math.max(Math.min((yMin + yMax) / 2, 20), -20);
    yMin = c - 20;
    yMax = c + 20;
  }
  const marge = (yMax - yMin) * 0.12;
  return { xMin, xMax, yMin: yMin - marge, yMax: yMax + marge };
}

function texteSvg(x: number, y: number, contenu: string, ancre: "start" | "end" | "middle", couleur: string): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="10" fill="${couleur}" text-anchor="${ancre}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke" font-family="Archivo, Arial, Helvetica, sans-serif">${contenu}</text>`;
}

export function construireSvgEtudeComplete(exercice: ExerciceEtudeCompletePipeline): string {
  const vb = fenetre(exercice);
  const etendue = vb.yMax - vb.yMin;
  const evaluer = (x: number): number | null => {
    if (exercice.exclusions.some((e) => Math.abs(x - e.position) < 1e-9)) return null;
    const y = evaluerF(exercice, x);
    // Seuil large : près d'une asymptote verticale, le dernier point tracé doit sortir du cadre (la
    // courbe rejoint le bord, le <svg> coupe le reste) au lieu de s'arrêter au milieu.
    return Number.isFinite(y) && y > vb.yMin - 6 * etendue && y < vb.yMax + 6 * etendue ? y : null;
  };
  const infini = exercice.infini;
  const droite = infini.type === "horizontale" ? (_x: number) => infini.limite : infini.type === "oblique" ? (x: number) => infini.pente * x + infini.ordonnee : null;
  // Point de recoupement : disque seul ici, étiquette ajoutée plus bas (décalée, avec halo) — celle de
  // `construireSvgFonction` se superpose à l'axe quand le point est en x = 0.
  const points = exercice.casSpecial ? [{ x: exercice.casSpecial.x, y: exercice.casSpecial.y }] : [];
  const svg = construireSvgFonction(evaluer, vb, {
    largeur: LARGEUR_SVG,
    hauteur: HAUTEUR_SVG,
    couleurCourbe: COULEUR_COURBE,
    classe: "figure-corrige",
    points,
    courbesSecondaires: droite ? [{ evaluer: droite, couleur: COULEUR_ASYMPTOTE, pointilles: true }] : undefined,
    legende: [
      { texte: "courbe de f", couleur: COULEUR_COURBE },
      { texte: "asymptotes", couleur: COULEUR_ASYMPTOTE, pointilles: true },
    ],
  });
  const zoneX = LARGEUR_SVG - 2 * MARGE_SVG;
  const zoneY = HAUTEUR_SVG - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - vb.xMin) / (vb.xMax - vb.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((vb.yMax - y) / (vb.yMax - vb.yMin)) * zoneY;
  const ajouts: string[] = [];
  // Raccord fin de la courbe de part et d'autre de chaque asymptote verticale : `construireSvgFonction`
  // échantillonne 240 points, trop peu près d'un pôle « faible » (la courbe s'arrêtait à mi-hauteur).
  const pas = (vb.xMax - vb.xMin) / 240;
  const limiteY = (y: number) => Math.min(Math.max(y, vb.yMin - etendue), vb.yMax + etendue);
  for (const e of exercice.exclusions.filter((x) => x.type !== "pointVide")) {
    for (const cote of [-1, 1]) {
      const pts: string[] = [];
      for (let d = 1.5 * pas; d > 1e-7; d *= 0.8) {
        const y = evaluerF(exercice, e.position + cote * d);
        if (!Number.isFinite(y)) break;
        pts.push(`${sx(e.position + cote * d).toFixed(1)},${sy(limiteY(y)).toFixed(1)}`);
        if (y < vb.yMin - etendue || y > vb.yMax + etendue) break;
      }
      if (pts.length > 1) ajouts.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2" stroke-linecap="round"/>`);
    }
  }
  // Asymptotes verticales (droites x = r) et leur équation en haut.
  for (const e of exercice.exclusions.filter((x) => x.type !== "pointVide")) {
    const X = sx(e.position);
    ajouts.push(`<line x1="${X.toFixed(1)}" y1="${MARGE_SVG}" x2="${X.toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_SVG}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.6" stroke-dasharray="6 4"/>`);
    ajouts.push(texteSvg(X + 4, HAUTEUR_SVG - MARGE_SVG - 6, `x = ${nombreTexte(e.position)}`, "start", COULEUR_ASYMPTOTE));
  }
  // Équation de l'asymptote horizontale / oblique, au bord droit.
  if (droite) {
    const xe = vb.xMax - (vb.xMax - vb.xMin) * 0.03;
    const ye = Math.min(Math.max(droite(xe), vb.yMin + etendue * 0.06), vb.yMax - etendue * 0.06);
    const eq = infini.type === "horizontale" ? `y = ${nombreTexte(infini.limite)}` : infini.type === "oblique" ? `y = ${formatPenteOrdonnee(infini.pente, infini.ordonnee).replace(/-/g, "−")}` : "";
    // Du côté de la droite opposé à la courbe (sinon l'équation chevauche le tracé).
    const fe = evaluerF(exercice, xe);
    const courbeAuDessus = Number.isFinite(fe) && fe > droite(xe);
    ajouts.push(texteSvg(sx(xe), sy(ye) + (courbeAuDessus ? 14 : -6), eq, "end", COULEUR_ASYMPTOTE));
  }
  if (exercice.casSpecial) {
    const { x, y } = exercice.casSpecial;
    ajouts.push(texteSvg(sx(x) + 7, sy(y) + (y >= (droite ? droite(x) : 0) ? -8 : 14), `(${nombreTexte(x)} ; ${nombreTexte(y)})`, "start", COULEUR_COURBE));
  }
  // Point retiré (cercle vide).
  const pv = exercice.exclusions.find((e) => e.type === "pointVide");
  if (pv && pv.valeurPointVide !== undefined) {
    ajouts.push(`<circle cx="${sx(pv.position).toFixed(1)}" cy="${sy(pv.valeurPointVide).toFixed(1)}" r="4" fill="#ffffff" stroke="${COULEUR_COURBE}" stroke-width="1.8"/>`);
  }
  return svg.replace("</svg>", `${ajouts.join("")}</svg>`);
}

