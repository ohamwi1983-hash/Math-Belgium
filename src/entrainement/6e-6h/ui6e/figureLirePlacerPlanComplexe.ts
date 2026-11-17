import type { ExerciceLirePlacer } from "../core6e/lirePlacerPlanComplexe.types";
import { COULEURS, planComplexeSvg, positionLoinDe } from "../generateurs6e/figuresPlanComplexe40-42";
import type { PointPlan, SegmentPlan } from "../generateurs6e/figuresPlanComplexe40-42";
import { BORNE_FENETRE } from "../moteur6e/modeleLirePlacerPlanComplexe";
import { graineDepuis } from "../moteur6e/saisieComplexe";
import { NOMS_IMAGES, imageDe } from "./formatLirePlacerPlanComplexe";

/**
 * Figures PAPIER de `6gen95` (SVG autonome, `planComplexeSvg` partagé avec 6gen40–42) :
 * - énoncé (`enteteHtml`) : A, (B,) C sur le quadrillage d'une unité, fenêtre FIXE [−5 ; 5]² (elle
 *   contient les points à placer sans en trahir la position), graduations sur les axes, AUCUNE
 *   coordonnée écrite — les points tombent sur des intersections du quadrillage ;
 * - corrigé (`figureHtml`) : la même figure avec P et Q placés (flèches pointillées depuis A) et le
 *   segment [OC] (module).
 * Identifiants SVG déterministes, dérivés du contenu (jamais un compteur global).
 */

const FENETRE = { xMin: -BORNE_FENETRE, xMax: BORNE_FENETRE, yMin: -BORNE_FENETRE, yMax: BORNE_FENETRE };
const VIOLET = "var(--plan, #5b4ea3)";

/** Étiquette loin de O ; sur un axe, à côté du point (jamais sur l'axe ni sur ses graduations). */
function position(x: number, y: number): PointPlan["position"] {
  if (x === 0) return "e";
  if (y === 0) return "n";
  return positionLoinDe([x, y], [0, 0]);
}

function pointsDonnees(e: ExerciceLirePlacer): PointPlan[] {
  const pts: PointPlan[] = [{ x: e.z.x, y: e.z.y, etiquette: "A", couleur: COULEURS.ciel, position: position(e.z.x, e.z.y) }];
  if (e.w) pts.push({ x: e.w.x, y: e.w.y, etiquette: "B", couleur: COULEURS.ciel, position: position(e.w.x, e.w.y) });
  pts.push({ x: e.c.x, y: e.c.y, etiquette: "C", couleur: VIOLET, position: position(e.c.x, e.c.y) });
  return pts;
}

function idFigure(e: ExerciceLirePlacer, sel: string): string {
  return `lp${sel}${graineDepuis(e, sel).toString(36)}`;
}

export function figureEnonceLirePlacerSvg(e: ExerciceLirePlacer): string {
  return planComplexeSvg({
    points: pointsDonnees(e),
    fenetreFixe: FENETRE,
    idBase: idFigure(e, "e"),
    libelle: `Plan complexe quadrillé : points A${e.w ? ", B" : ""} et C`,
  });
}

export function figureCorrigeLirePlacerSvg(e: ExerciceLirePlacer): string {
  const points = pointsDonnees(e);
  const segments: SegmentPlan[] = [{ de: [0, 0], a: [e.c.x, e.c.y], couleur: VIOLET, pointilles: true }];
  ([0, 1] as const).forEach((i) => {
    const p = imageDe(e, i);
    points.push({ x: p.x, y: p.y, etiquette: NOMS_IMAGES[i], couleur: COULEURS.bon, position: position(p.x, p.y) });
    segments.push({ de: [e.z.x, e.z.y], a: [p.x, p.y], couleur: COULEURS.bon, pointilles: true, fleche: true });
  });
  return planComplexeSvg({
    points,
    segments,
    fenetreFixe: FENETRE,
    idBase: idFigure(e, "c"),
    libelle: "Corrigé : points P et Q placés, segment [OC]",
  });
}
