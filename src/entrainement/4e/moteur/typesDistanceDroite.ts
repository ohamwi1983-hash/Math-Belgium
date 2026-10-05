import type { ExerciceDistanceDroite, GenerateurExerciceDistanceDroite, VarianteDistanceDroite } from "../core/distanceDroite.types";
import type { DroiteImplicite } from "../core/droite.types";
import type { ReglagesSession } from "../core/session.types";
import type { Point } from "../core/vecteur.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * 4 phases possibles — `"choixPoint"` n'a jamais lieu pour la variante "point" (le point est déjà
 * donné dans l'énoncé) : `etatInitial` démarre alors directement à `"equationB"`.
 * `equationB → intersectionQ → distancePQ` sont TOUJOURS traversées, dans cet ordre, pour les deux
 * variantes — "distancePQ" est toujours la phase terminale.
 */
export type PhaseDistanceDroite = "choixPoint" | "equationB" | "intersectionQ" | "distancePQ";

export interface ResultatExerciceDistanceDroite {
  variante: VarianteDistanceDroite;
  /** `null` pour la variante "point" (écran sauté), toujours un `number` pour "paralleles". */
  scoreChoixPoint: number | null;
  choixPointRevele: boolean;
  /** Capturé à la clôture de chaque écran — jamais dérivé du score seul (récapitulatif final,
   * `promptuniformisationrecap4e.md` : une tentative ratée sans aide reste verte). `0` pour
   * "choixPoint" quand cet écran est sauté (variante "point"). */
  niveauAideChoixPoint: number;
  scoreEquationB: number;
  equationBRevele: boolean;
  niveauAideEquationB: number;
  scoreIntersectionQ: number;
  intersectionQRevele: boolean;
  niveauAideIntersectionQ: number;
  scoreDistancePQ: number;
  distancePQRevele: boolean;
  niveauAideDistancePQ: number;
}

export interface EtatSessionDistanceDroite {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceDistanceDroite;
  indexExercice: number;
  exerciceCourant: ExerciceDistanceDroite;
  phase: PhaseDistanceDroite;
  etapeCourante: EtatEtapeTentatives;
  niveauAideChoixPoint: number;
  niveauAideEquationB: number;
  niveauAideIntersectionQ: number;
  niveauAideDistancePQ: number;
  scoreChoixPointExercice: number | null;
  choixPointRevele: boolean;
  scoreEquationBExercice: number | null;
  equationBRevele: boolean;
  scoreIntersectionQExercice: number | null;
  intersectionQRevele: boolean;
  /**
   * Valeurs DYNAMIQUES — jamais présentes sur le contrat `ExerciceDistanceParalleles` lui-même
   * (le point de départ n'y est connu qu'une fois choisi par l'élève, voir `core/distanceDroite.types.ts`) :
   * `point`/`droiteCible`/`bAttendue`/`qAttendu` sont connues DÈS `etatInitial` pour la variante
   * "point" (lues directement depuis le contrat, `exercice.point`/`exercice.d`/`exercice.bAttendue`/
   * `exercice.q`), et calculées dynamiquement dans `soumettreReponseChoixPoint` pour la variante
   * "paralleles" — à partir de là, les écrans "equationB"/"intersectionQ"/"distancePQ" les lisent
   * UNIFORMÉMENT depuis l'état de session, sans plus jamais dispatcher sur `exercice.variante`
   * (satisfait l'exigence de la spec : "Écrans 1 à 3 identiques à la variante A").
   */
  point: Point | null;
  droiteCible: DroiteImplicite | null;
  bAttendue: DroiteImplicite | null;
  qAttendu: Point | null;
  resultats: ResultatExerciceDistanceDroite[];
  terminee: boolean;
}
