import type { Triangle } from "./triangle.types";

/**
 * Couche core — "Applications physiques (résultante de vecteurs)" (chapitre "Calcul vectoriel",
 * huitième et dernier générateur). **Réutilise directement le triangle vectoriel déjà résolu par
 * l'infrastructure partagée du chapitre 3** ("Cercle trigonométrique et triangles quelconques",
 * voir CLAUDE.md, section "Infrastructure partagée — générateurs triangle") : placer les deux
 * vecteurs composants bout à bout (relation de Chasles) forme un triangle dont un côté est la
 * résultante — `resoudreSAS` (`generateurs/triangle/resoudreTriangle.ts`) le résout entièrement,
 * pour LES DEUX variantes (angle droit compris comme cas particulier `interieur=90°` de la loi des
 * cosinus, jamais un chemin de calcul séparé pour Pythagore).
 *
 * `triangle` : `a` = norme de la résultante (côté opposé à l'angle intérieur du triangle
 * vectoriel), `b` = v1, `c` = v2, `A` = angle intérieur (`180° - angleEntreVecteurs`), `C` = angle
 * de déviation (entre v1 et la résultante) — voir `generateurs/applicationPhysique/index.ts` pour
 * le détail complet du calcul.
 */
export type VarianteApplicationPhysique = "angleDroit" | "angleQuelconque";
export type ContexteApplicationPhysique = "avion" | "helicoptere" | "forces";
export type CoteDeviation = "est" | "ouest";

export interface ExerciceApplicationPhysique {
  variante: VarianteApplicationPhysique;
  contexte: ContexteApplicationPhysique;
  labelV1: string;
  labelV2: string;
  unite: string;
  v1: number;
  v2: number;
  /** Angle donné dans l'énoncé entre les deux vecteurs composants — toujours 90 pour "angleDroit". */
  angleEntreVecteurs: number;
  coteDeviation: CoteDeviation;
  triangle: Triangle;
  /**
   * Direction cardinale correcte de la résultante (ex. "Nord-Est") — dérivée de la GÉOMÉTRIE
   * RÉELLE (`triangle.C`, l'angle de déviation entre v1/F1 et la résultante) et de `coteDeviation`,
   * jamais figée à "Nord" par construction (bug corrigé, voir `generateurs/applicationPhysique/
   * index.ts` — audit empirique ayant confirmé que `triangle.C` peut dépasser 90°, en particulier
   * dans le contexte "forces" combiné à un angle obtus entre les vecteurs composants, faisant
   * réellement basculer la résultante côté Sud) : `triangle.C < 90` → Nord (Nord-Est/Nord-Ouest
   * selon `coteDeviation`), `triangle.C > 90` → Sud (Sud-Est/Sud-Ouest selon `coteDeviation`).
   */
  directionCorrecte: string;
}

export type GenerateurExerciceApplicationPhysique = () => ExerciceApplicationPhysique;
