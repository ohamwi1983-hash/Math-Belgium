import type { ExerciceLectureGraphiqueLimites } from "../../core5e/lectureGraphiqueLimites.types";
import { construireSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import { BUFFER_VA, calculerBornesXLimites, calculerViewBoxLectureGraphique, construireMarqueursPointIsole, construirePieces, evaluerPieceMelangee } from "../../ui5e/lectureGraphiqueLimitesCourbe";

/**
 * Figures papier de 5gen22 (graphique de l'énoncé, graphique annoté du corrigé) — sorties de
 * `exportEvaluation.ts` (qui importe `docx`) pour être partagées avec le corrigé détaillé
 * (`corrigeDetaille.ts`, importé par `App5gen22.tsx`). Voir l'en-tête de `exportEvaluation.ts` pour
 * le détail du tracé (courbe par morceaux, asymptotes en pointillés ajoutées en post-traitement).
 */

const LARGEUR_GRAPHE = 300;
const HAUTEUR_GRAPHE = 240;
// Dupliqué depuis `MARGE` de `export/svgGraph.ts` (non exportée) — UNIQUEMENT pour repositionner les
// lignes d'asymptote au même repère pixel que la courbe déjà tracée par `construireSvgFonction`.
const MARGE_SVG_LOCALE = 10;
// `COULEUR_AXE` de `export/svgGraph.ts` — dashed, pour rester distinct du bleu de la courbe
// (`COULEUR_COURBE_DEFAUT`) et du gris très clair de la grille (`COULEUR_GRILLE`).
const COULEUR_ASYMPTOTE = "#495057";

/** Aiguillage par morceau — bornes FIXES (`calculerBornesXLimites`), jamais le viewport (voir la doc
 * de `construireSegments` dans `ui5e/lectureGraphiqueLimitesCourbe.ts` sur ce piège, non pertinent
 * ici puisqu'un SVG imprimé n'a ni zoom ni pan, mais la fonction évaluée doit rester cohérente avec
 * le viewBox fixe passé à `construireSvgFonction`). */
function construireEvaluerGrapheLimites(exercice: ExerciceLectureGraphiqueLimites): (x: number) => number | null {
  const [xMin, xMax] = calculerBornesXLimites(exercice);
  const zones = construirePieces(exercice).map((piece) => ({
    piece,
    lo: piece.loVA === null ? xMin : piece.loVA + BUFFER_VA,
    hi: piece.hiVA === null ? xMax : piece.hiVA - BUFFER_VA,
  }));
  return (x: number) => {
    const zone = zones.find((z) => x >= z.lo && x <= z.hi);
    return zone ? evaluerPieceMelangee(zone.piece, zone.lo, zone.hi, x) : null;
  };
}

function construireLigneAsymptoteSvg(x1: number, y1: number, x2: number, y2: number, viewBox: ViewBoxSvg): string {
  const zoneX = LARGEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const zoneY = HAUTEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const sx = (x: number) => MARGE_SVG_LOCALE + ((x - viewBox.xMin) / (viewBox.xMax - viewBox.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG_LOCALE + ((viewBox.yMax - y) / (viewBox.yMax - viewBox.yMin)) * zoneY;
  return `<line x1="${sx(x1).toFixed(1)}" y1="${sy(y1).toFixed(1)}" x2="${sx(x2).toFixed(1)}" y2="${sy(y2).toFixed(1)}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.6"/>`;
}

/** Une ligne pointillée par asymptote RÉELLEMENT présente — même tirage de comportement à l'infini
 * que `LectureGraphiqueLimitesGraph.tsx` (0, 1 ou 2 horizontales selon égalité en ±∞ ; oblique unique
 * ; aucune ligne pour `infini.type === "aucune"`). */
function construireLignesAsymptotesSvg(exercice: ExerciceLectureGraphiqueLimites, viewBox: ViewBoxSvg): string {
  const lignes: string[] = exercice.vas.map((va) => construireLigneAsymptoteSvg(va.position, viewBox.yMin, va.position, viewBox.yMax, viewBox));
  const { infini } = exercice;
  if (infini.type === "horizontale") {
    const valeurs = infini.limitePlusInfini === infini.limiteMoinsInfini ? [infini.limitePlusInfini] : [infini.limitePlusInfini, infini.limiteMoinsInfini];
    for (const y of valeurs) lignes.push(construireLigneAsymptoteSvg(viewBox.xMin, y, viewBox.xMax, y, viewBox));
  } else if (infini.type === "oblique") {
    lignes.push(construireLigneAsymptoteSvg(viewBox.xMin, infini.pente * viewBox.xMin + infini.ordonnee, viewBox.xMax, infini.pente * viewBox.xMax + infini.ordonnee, viewBox));
  }
  return lignes.join("");
}

export function construireSvgLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): string {
  const vb = calculerViewBoxLectureGraphique(exercice);
  const viewBox: ViewBoxSvg = { xMin: vb.x[0], xMax: vb.x[1], yMin: vb.y[0], yMax: vb.y[1] };
  const points = construireMarqueursPointIsole(exercice).map((m) => ({ x: m.x, y: m.y }));
  const svg = construireSvgFonction(construireEvaluerGrapheLimites(exercice), viewBox, {
    largeur: LARGEUR_GRAPHE,
    hauteur: HAUTEUR_GRAPHE,
    classe: "graphe-limites",
    points,
  });
  // Post-traitement : voir l'en-tête du fichier — `construireSvgFonction` n'a pas de paramètre pour
  // des lignes arbitraires, les asymptotes sont réinsérées ici, APRÈS la courbe/les points (donc
  // rendues par-dessus, comme les traits `dashed` de `LectureGraphiqueLimitesGraph.tsx`).
  return svg.replace("</svg>", `${construireLignesAsymptotesSvg(exercice, viewBox)}</svg>`);
}

const COULEUR_LECTURE = "#9a3b12";

function etiquetteSvg(x: number, y: number, contenu: string, ancre: "start" | "middle" | "end"): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="9" font-weight="bold" fill="${COULEUR_LECTURE}" text-anchor="${ancre}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke" font-family="Archivo, Arial, Helvetica, sans-serif">${contenu}</text>`;
}

/** Nombre écrit dans le SVG : virgule décimale et vrai signe moins. */
function nombreSvg(v: number): string {
  return String(v).replace(".", ",").replace("-", "−");
}

function droiteSvg(pente: number, ordonnee: number): string {
  const p = pente === 1 ? "x" : pente === -1 ? "−x" : `${nombreSvg(pente)}x`;
  return ordonnee === 0 ? p : `${p} ${ordonnee < 0 ? "−" : "+"} ${nombreSvg(Math.abs(ordonnee))}`;
}

/** Corrigé : le graphique de l'énoncé, chaque asymptote ÉTIQUETÉE par son équation (même repère pixel
 * que `construireSvgFonction`, voir `construireLigneAsymptoteSvg`). */
export function construireSvgCorrige(exercice: ExerciceLectureGraphiqueLimites): string {
  const vb = calculerViewBoxLectureGraphique(exercice);
  const viewBox: ViewBoxSvg = { xMin: vb.x[0], xMax: vb.x[1], yMin: vb.y[0], yMax: vb.y[1] };
  const zoneX = LARGEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const zoneY = HAUTEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const sx = (x: number) => MARGE_SVG_LOCALE + ((x - viewBox.xMin) / (viewBox.xMax - viewBox.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG_LOCALE + ((viewBox.yMax - y) / (viewBox.yMax - viewBox.yMin)) * zoneY;
  const etiquettes: string[] = [];
  exercice.vas.forEach((va, i) => {
    const X = sx(va.position);
    const aGauche = X > LARGEUR_GRAPHE - 50;
    etiquettes.push(etiquetteSvg(aGauche ? X - 4 : X + 4, MARGE_SVG_LOCALE + 12 + 12 * i, `x = ${nombreSvg(va.position)}`, aGauche ? "end" : "start"));
  });
  const { infini } = exercice;
  if (infini.type === "horizontale") {
    const memes = infini.limitePlusInfini === infini.limiteMoinsInfini;
    etiquettes.push(etiquetteSvg(LARGEUR_GRAPHE - MARGE_SVG_LOCALE - 3, sy(infini.limitePlusInfini) - 4, `y = ${nombreSvg(infini.limitePlusInfini)}${memes ? "" : " (en +∞)"}`, "end"));
    if (!memes) etiquettes.push(etiquetteSvg(MARGE_SVG_LOCALE + 3, sy(infini.limiteMoinsInfini) - 4, `y = ${nombreSvg(infini.limiteMoinsInfini)} (en −∞)`, "start"));
  } else if (infini.type === "oblique") {
    const etendueY = viewBox.yMax - viewBox.yMin;
    const xLabel = viewBox.xMin + 0.78 * (viewBox.xMax - viewBox.xMin);
    const yLabel = Math.min(Math.max(infini.pente * xLabel + infini.ordonnee, viewBox.yMin + 0.08 * etendueY), viewBox.yMax - 0.05 * etendueY);
    etiquettes.push(etiquetteSvg(sx(xLabel), sy(yLabel) + (infini.pente > 0 ? 12 : -6), `y = ${droiteSvg(infini.pente, infini.ordonnee)}`, "middle"));
  }
  return construireSvgLectureGraphiqueLimites(exercice)
    .replace('class="graphe-limites"', 'class="figure-corrige"')
    .replace("</svg>", `${etiquettes.join("")}</svg>`);
}

