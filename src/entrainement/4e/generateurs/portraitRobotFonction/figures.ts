import { construireSvgFonction } from "../../../export/svgGraph";
import type { ExerciceCourbe, ExerciceExpression, FonctionTransformee } from "../../core/portraitRobotFonction.types";
import { asymptoteHorizontale, evaluerFonction } from "../../moteur/modelePortraitRobot";
import { LETTRES_COURBES } from "../../ui/formatPortraitRobot";

/**
 * Figures papier de gen71 (grille des quatre courbes, graphique de l'expression trouvée) — sans
 * dépendance à `docx`, pour être importées par le corrigé détaillé partagé avec l'appli.
 */

const FENETRE = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };
const LARGEUR = 220;
const MARGE = 10; // `export/svgGraph.ts` : marge intérieure du tracé

function evaluateurCoupe(f: FonctionTransformee, yMin: number, yMax: number) {
  const marge = yMax - yMin;
  return (x: number) => {
    const y = evaluerFonction(f, x);
    return y === null || y < yMin - marge || y > yMax + marge ? null : y;
  };
}

/** Courbe de f dans une fenêtre donnée, asymptotes en pointillé, point de départ de la racine. */
function svgFonction(f: FonctionTransformee, fenetre: typeof FENETRE, options: { lettre?: string; estCorrect?: boolean } = {}): string {
  const asymptoteH = asymptoteHorizontale(f);
  const svg = construireSvgFonction(evaluateurCoupe(f, fenetre.yMin, fenetre.yMax), fenetre, {
    lettre: options.lettre,
    estCorrect: options.estCorrect,
    largeur: LARGEUR,
    hauteur: LARGEUR,
    divisionsX: fenetre.xMax - fenetre.xMin,
    divisionsY: fenetre.yMax - fenetre.yMin,
    courbesSecondaires: asymptoteH !== null ? [{ evaluer: () => asymptoteH, couleur: "#8a8f98", pointilles: true }] : [],
    points: f.famille === "racine_carree" ? [{ x: f.h, y: f.k }] : [],
  });
  if (f.famille !== "inverse") return svg;
  const px = MARGE + ((f.h - fenetre.xMin) / (fenetre.xMax - fenetre.xMin)) * (LARGEUR - 2 * MARGE);
  const ligne = `<line x1="${px.toFixed(1)}" y1="${MARGE}" x2="${px.toFixed(1)}" y2="${LARGEUR - MARGE}" stroke="#8a8f98" stroke-width="1.6" stroke-dasharray="6 4"/>`;
  return svg.replace("</svg>", `${ligne}</svg>`);
}

export function grilleCourbes(e: ExerciceCourbe, corrige = false): string {
  const figures = e.courbes.map((f, i) => svgFonction(f, FENETRE, { lettre: LETTRES_COURBES[i], estCorrect: corrige && i === e.indexCorrect })).join("");
  return `<div class="grille-graphes-cyclo">${figures}</div>`;
}

/** Graphique de la fonction trouvée (corrigé de la famille A), centré sur (TH ; TV). */
export function figureExpression(e: ExerciceExpression): string {
  const { h, k } = e.cible;
  return svgFonction(e.cible, { xMin: h - 6, xMax: h + 6, yMin: k - 6, yMax: k + 6 });
}

