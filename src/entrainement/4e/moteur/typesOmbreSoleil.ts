import type { ExerciceOmbreSoleil, GenerateurExerciceOmbreSoleil } from "../core/ombreSoleil.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Couche B — "Ombre au soleil" (41e générateur, chapitre "Géométrie dans l'espace").
 *
 * **Séquence de phases dépendant de la variante** (refonte de l'audit du chapitre 8) :
 * - `simple` : `pointSimple` → `conclusion`.
 * - `obstacle` : `direction` → `point` (une seule question par scène : le premier impact réel du
 *   rayon, décision H4a) → `conclusion`.
 * - `directionInconnue` : `directionInconnue` (déduire la direction) → `point` (un écran par sommet
 *   à projeter ; plus d'écran "direction" répété par sommet, la direction étant déjà connue) →
 *   `conclusion` (contour de l'ombre).
 */

export type PhaseOmbreSoleil = "pointSimple" | "directionInconnue" | "direction" | "point" | "conclusion";

/** `revelees`/`niveauxAide` sont parallèles à `scores` (même index = même écran noté). */
export interface ResultatExerciceOmbreSoleil {
  scores: number[];
  scoreMoyen: number;
  revelees: boolean[];
  niveauxAide: number[];
}

export interface EtatSessionOmbreSoleil {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceOmbreSoleil;
  indexExercice: number;
  exerciceCourant: ExerciceOmbreSoleil;
  phase: PhaseOmbreSoleil;
  /** Sommets déjà projetés (variante `directionInconnue`) — indices dans `exercice.piquets` ; le
   * sommet courant est toujours `resolus.length`. Toujours `[]` pour les deux autres variantes. */
  resolus: number[];
  etapeCourante: EtatEtapeTentatives;
  /** Aide progressive de l'écran courant — remise à 0 à chaque écran noté. */
  niveauAide: number;
  /** Une entrée par écran noté déjà clos de l'exercice en cours (même index que la puce). */
  scoresAccumules: number[];
  revelesAccumules: boolean[];
  niveauxAideAccumules: number[];
  resultats: ResultatExerciceOmbreSoleil[];
  terminee: boolean;
}
