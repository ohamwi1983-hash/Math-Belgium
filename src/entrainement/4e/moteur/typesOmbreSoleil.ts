import type { ExerciceOmbreSoleil, GenerateurExerciceOmbreSoleil } from "../core/ombreSoleil.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Couche B — "Ombre au soleil" (41e générateur, chapitre "Géométrie dans l'espace").
 *
 * **Séquence de phases dépendant de la variante, jamais un même chemin fixe pour les 3** :
 * - `simple` : `pointSimple` (seul écran, toujours terminal après lui vers `conclusion`).
 * - `obstacle` : `direction` (une seule fois, jamais répétée) → `point` (répété une fois PAR
 *   SOLIDE-OBSTACLE, jamais par face/marche — décision explicite : "une itération de boucle par
 *   solide-obstacle") → `conclusion`.
 * - `directionInconnue` : `directionInconnue` (étape 0) → `direction` → `point` → `direction` →
 *   `point` → ... (répété par piquet, comportement HISTORIQUE inchangé par l'extension) →
 *   `conclusion`.
 *
 * Contrairement à "Section plane d'un solide" (40e générateur, `typesSectionPlaneSolide.ts`), la
 * phase suivante n'a PAS besoin d'être recalculée dynamiquement depuis un état vivant complexe : la
 * progression de la boucle se déduit trivialement de `resolus.length` face au nombre d'items à
 * résoudre (`exercice.obstacles.length` pour `obstacle`, `exercice.piquets.length` pour
 * `directionInconnue`) — chaque fonction de soumission assigne donc sa phase suivante directement,
 * sans fonction `phaseDepuisEtat` séparée. Seule `soumettreReponsePoint` (`sessionOmbreSoleil.ts`)
 * dispatch sur la variante pour décider de cette phase suivante — `direction` n'a jamais besoin de
 * connaître la variante, son unique transition (`→ "point"`) est identique dans les deux cas.
 */

export type PhaseOmbreSoleil = "pointSimple" | "directionInconnue" | "direction" | "point" | "conclusion";

/** `revelees`/`niveauxAide` sont parallèles à `scores` (même index = même action notée) — capturés
 * au moment précis où chaque écran se clôt (jamais dérivés du score seul après coup), pour le
 * récapitulatif final coloré (`ResultatPanelOmbreSoleil.tsx`, `LigneRecap`/`statutRecap`) : même
 * piège documenté que "Section plane d'un solide" (CLAUDE.md, "une tentative ratée sans aide reste
 * verte"). */
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
  /** Indices déjà résolus de la boucle courante — dans `exercice.obstacles` pour la variante
   * `obstacle`, dans `exercice.piquets` pour `directionInconnue` (toujours `[]` pour `simple`, qui
   * n'a ni l'un ni l'autre). L'item courant de la boucle est toujours `resolus.length` (le premier
   * non résolu, dans l'ordre du tableau) — jamais un second compteur séparé. */
  resolus: number[];
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE — un seul compteur, portant sur l'unité pédagogique courante : remis à 0 à
   * chaque nouvel item de la boucle (jamais entre "direction" et le premier "point" qui suit —
   * partagent leurs 2 niveaux d'aide, que ce soit le premier piquet de `directionInconnue` ou le
   * premier obstacle d'`obstacle`, même principe que "Section plane d'un solide" —, mais bien remis
   * à 0 à chaque nouvel obstacle/piquet suivant, y compris entre deux "point" consécutifs de la
   * variante `obstacle`, qui n'ont plus jamais de "direction" intermédiaire entre eux), et à l'étape
   * "directionInconnue" (indépendante). Aucune aide sur "conclusion". */
  niveauAide: number;
  /** Scores déjà clos de l'exercice EN COURS — accumulés au fil de la boucle, agrégés en
   * `scoreMoyen` seulement à la clôture (écran "conclusion"). `revelesAccumules`/
   * `niveauxAideAccumules` sont parallèles (même index), capturés à la clôture de chaque écran —
   * voir `ResultatExerciceOmbreSoleil`. */
  scoresAccumules: number[];
  revelesAccumules: boolean[];
  niveauxAideAccumules: number[];
  resultats: ResultatExerciceOmbreSoleil[];
  terminee: boolean;
}
