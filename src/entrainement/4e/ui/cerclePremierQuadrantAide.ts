/**
 * Géométrie propre à l'aide de l'écran "Angle du premier quadrant"
 * (promptcorrectionsgenerateur14aides.md, section 7) : le point symétrique de θ dans le premier
 * quadrant (celui d'angle `anglePremierQuadrant`, toujours dans [0°,90°]), le petit arc d'angle
 * labellisé "?" entre l'axe X et le rayon de ce point, et la décision d'afficher ou non la ligne
 * pointillée reliant le point de θ à ce point (uniquement pour une symétrie ORTHOGONALE — quadrant
 * II ou IV — jamais pour une symétrie centrale — quadrant III — ni pour le quadrant I, où les deux
 * points coïncident, ni pour axeOy, où 90° est une convention fixe, pas une vraie symétrie).
 *
 * Cas axeOx corrigé (promptcorrectionsgenerateur14lot2.md, section 3) : `anglePremierQuadrant` y
 * vaut désormais 0° (0°/180°/360° sont des multiples pairs de 90°), mais le point/rayon "du premier
 * quadrant" affiché ne doit PAS être tracé au math-angle 0 littéral (qui ne coïnciderait avec le
 * point de θ que pour angleReduit=0, pas pour 180°) — il doit se SUPERPOSER avec le point de θ
 * lui-même, quelle que soit sa position réelle (0° ou 180°). D'où le paramètre `angleReduit`
 * supplémentaire, utilisé exclusivement dans ce cas.
 */
import { RAYON_CERCLE_TRIG, pointSurCercle } from "./cercleTrigGeometrie";
import type { PointCroquisCercleTrig } from "./cercleTrigGeometrie";
import type { Quadrant } from "../core/cercleTrigonometrique.types";
import { construireFlecheDirectionnelle, directionTangente } from "./cercleTrigTrajet";
import type { PointsPolygone } from "./cercleTrigTrajet";

export interface AidePremierQuadrant {
  point: PointCroquisCercleTrig;
  /** Attribut `d` du petit arc d'angle entre l'axe X et le rayon de ce point — `null` si
   * `anglePremierQuadrant=0` (arc dégénéré, rien à tracer — cas axeOx). */
  arcAngleChemin: string | null;
  /** Flèche directionnelle (triangle plein) à l'extrémité de `arcAngleChemin`, indiquant le sens de
   * parcours (toujours de l'axe X vers `anglePremierQuadrant`, mathématiquement croissant) — `null`
   * exactement quand `arcAngleChemin` l'est (`promptgen17gen15correctionsvisuelles.md`, B.1 : cet
   * arc n'avait jusqu'ici aucune orientation, contrairement au trajet principal de
   * `cercleTrigTrajet.ts`, qui en a toujours eu une). Même primitive que ce dernier
   * (`construireFlecheDirectionnelle`/`directionTangente`, désormais exportées), jamais un second
   * algorithme dupliqué. */
  fleche: PointsPolygone | null;
  /** Position du label "?" — au milieu de l'arc d'angle, jamais sur le point lui-même. */
  labelQuestion: PointCroquisCercleTrig;
  /** Ligne pointillée point-de-θ ↔ point-du-premier-quadrant — uniquement pour une symétrie orthogonale. */
  afficherLignePointillee: boolean;
}

const RAYON_ARC_QUESTION = RAYON_CERCLE_TRIG * 0.2;
const DECALAGE_LABEL_QUESTION = 12;

export function calculerAidePremierQuadrant(anglePremierQuadrant: number, quadrant: Quadrant, angleReduit: number): AidePremierQuadrant {
  const point = quadrant === "axeOx" ? pointSurCercle(angleReduit, RAYON_CERCLE_TRIG) : pointSurCercle(anglePremierQuadrant, RAYON_CERCLE_TRIG);

  let arcAngleChemin: string | null = null;
  let fleche: PointsPolygone | null = null;
  if (anglePremierQuadrant > 0) {
    const depart = pointSurCercle(0, RAYON_ARC_QUESTION);
    const arrivee = pointSurCercle(anglePremierQuadrant, RAYON_ARC_QUESTION);
    arcAngleChemin = `M ${depart.x} ${depart.y} A ${RAYON_ARC_QUESTION} ${RAYON_ARC_QUESTION} 0 0 0 ${arrivee.x} ${arrivee.y}`;
    // Arc toujours parcouru dans le sens mathématique croissant (0° -> anglePremierQuadrant, jamais
    // l'inverse) — même convention que `sens=1` de `cercleTrigTrajet.ts` (sweep=0).
    fleche = construireFlecheDirectionnelle(arrivee, directionTangente(anglePremierQuadrant, RAYON_ARC_QUESTION, 1));
  }

  const labelQuestion = pointSurCercle(anglePremierQuadrant / 2, RAYON_ARC_QUESTION + DECALAGE_LABEL_QUESTION);

  const afficherLignePointillee = quadrant === "II" || quadrant === "IV";

  return { point, arcAngleChemin, fleche, labelQuestion, afficherLignePointillee };
}
