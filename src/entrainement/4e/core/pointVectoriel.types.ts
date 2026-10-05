/**
 * Couche core — "Point/coordonnée à partir d'une relation vectorielle" (chapitre "Calcul
 * vectoriel", premier générateur). 3 variantes ; la troisième ("relationGenerale") se ramifie en 2
 * formes internes non exposées comme variantes séparées (même principe que les sous-variantes
 * internes déjà présentes ailleurs dans le projet, ex. `deux_fractions_lineaires` — exercice
 * "L'inconnue au dénominateur") :
 * - `"pointAPoint"` : deux vecteurs partageant la même origine (`\vec{BF} = k\vec{BE}`), `B`/`E`
 *   connus, `F` cherché.
 * - `"combinaisonVecteurs"` : un point connu et une combinaison de deux vecteurs LIBRES nommés
 *   (`\vec{AE} = c_1\vec u + c_2\vec v`), `A` connu, `E` cherché.
 */
import type { Composantes, Point } from "./vecteur.types";

export type VariantePointVectoriel = "translation" | "milieu" | "relationGenerale";

export interface ExerciceTranslation {
  variante: "translation";
  point: Point;
  labelPoint: string; // "A" ou "O" (origine)
  translation: Composantes;
  pointCherche: string; // ex "A'"
  reponse: Point;
}

export interface ExerciceMilieu {
  variante: "milieu";
  pointA: Point;
  labelA: string;
  pointB: Point;
  labelB: string;
  pointCherche: string; // "M"
  reponse: Point;
}

export interface ExerciceRelationPointAPoint {
  variante: "relationGenerale";
  forme: "pointAPoint";
  pointOrigine: Point;
  labelOrigine: string; // "B"
  pointConnu: Point;
  labelConnu: string; // "E"
  coefficient: number; // k, ex -1/2
  pointCherche: string; // "F"
  reponse: Point;
}

export interface ExerciceRelationCombinaison {
  variante: "relationGenerale";
  forme: "combinaisonVecteurs";
  pointDepart: Point;
  labelDepart: string; // "A"
  vecteurU: Composantes;
  labelU: string; // "u"
  vecteurV: Composantes;
  labelV: string; // "v"
  coefU: number;
  coefV: number;
  pointCherche: string; // "E"
  reponse: Point;
}

export type ExercicePointVectoriel = ExerciceTranslation | ExerciceMilieu | ExerciceRelationPointAPoint | ExerciceRelationCombinaison;

export type GenerateurExercicePointVectoriel = () => ExercicePointVectoriel;
