import type { FormeSortieDroite } from "../core/droite.types";
import type { ExerciceEquationDroite, GenerateurExerciceEquationDroite, TypeDonneeEntree } from "../core/equationDroite.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";
import type { ReponseExpliciteX, ReponseExpliciteY, ReponseImplicite, ReponseParametrique, ReponsePossibiliteCoefficients } from "./verificationEquationDroite";

/** Réponse de l'écran "coefficients" — la forme dépend de `exercice.formeCible`, jamais resaisie
 * indépendamment (le composant appelant sait déjà quelle forme cibler). */
export type ReponseCoefficients = ReponseParametrique | ReponseImplicite | ReponseExpliciteY | ReponseExpliciteX;

/**
 * Séquence dépendant de `formeCible` (`promptgen42modificationsv2.md`) — 3 chemins DISJOINTS,
 * jamais les 4 noms de phase atteints par une même instance :
 * - "implicite" : `extraction → possibilite → coefficients` (INCHANGÉ — seule forme où l'écran
 *   "possibilite" séparé subsiste, `possible` y est toujours vrai par construction).
 * - "parametrique" : `extraction → coefficients` (partie B.1 — écran "possibilite" supprimé, une
 *   droite pouvant TOUJOURS s'écrire sous forme paramétrique, ce test n'avait pas de vraie
 *   alternative).
 * - "explicite_y"/"explicite_x" : `extraction → possibiliteCoefficients` (partie A — fusionne
 *   l'ancien couple "possibilite"+"coefficients" en un seul écran, terminal).
 */
export type PhaseEquationDroite = "extraction" | "possibilite" | "coefficients" | "possibiliteCoefficients";

export interface ResultatExerciceEquationDroite {
  typeDonnee: TypeDonneeEntree;
  formeCible: FormeSortieDroite;
  scoreExtraction: number;
  extractionRevele: boolean;
  /** Aide utilisée sur l'écran "extraction" (`niveauAideExtraction > 0` au moment où cet écran s'est
   * clos, capturé une fois pour toutes — jamais relu après coup) — pour le récapitulatif final
   * uniformisé (`LigneRecap`/`statutRecap`), qui distingue "correct sans aide" (vert) de "correct
   * avec aide" (orange). */
  extractionAideUtilisee: boolean;
  /** `null` pour "parametrique" (écran supprimé, partie B.1) et pour "explicite_y"/"explicite_x"
   * (fusionné dans `scorePossibiliteCoefficients`, partie A) — non-`null` uniquement pour
   * "implicite", seule forme où cet écran séparé subsiste. */
  scorePossibilite: number | null;
  possibiliteRevele: boolean;
  /** `null` ssi `formeCible` est "explicite_y"/"explicite_x" (fusionné, voir
   * `scorePossibiliteCoefficients`) — non-`null` pour "implicite"/"parametrique", toujours atteint
   * pour ces deux formes (`possible` toujours vrai). */
  scoreCoefficients: number | null;
  coefficientsRevele: boolean;
  /** Même principe que `extractionAideUtilisee`, pour l'écran "coefficients" — toujours `false`
   * quand cet écran n'a pas eu lieu (`scoreCoefficients === null`). */
  coefficientsAideUtilisee: boolean;
  /** Écran fusionné (partie A) — non-`null` uniquement pour "explicite_y"/"explicite_x", `null`
   * pour "implicite"/"parametrique" (qui n'ont pas cet écran). */
  scorePossibiliteCoefficients: number | null;
  possibiliteCoefficientsRevele: boolean;
  /** Même principe que `extractionAideUtilisee`, pour l'écran fusionné "possibilité + équation" —
   * toujours `false` quand cet écran n'a pas eu lieu (`scorePossibiliteCoefficients === null`). */
  possibiliteCoefficientsAideUtilisee: boolean;
}

export interface EtatSessionEquationDroite {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceEquationDroite;
  indexExercice: number;
  exerciceCourant: ExerciceEquationDroite;
  phase: PhaseEquationDroite;
  etapeCourante: EtatEtapeTentatives;
  niveauAideExtraction: number;
  niveauAidePossibilite: number;
  niveauAideCoefficients: number;
  niveauAidePossibiliteCoefficients: number;
  /** Scores des écrans déjà clos de cet exercice, conservés jusqu'à la clôture de l'exercice
   * entier (même principe que `scoreConstructionExercice`/`scoreReductionExercice`,
   * `typesColinearite.ts`). "possibiliteCoefficients" n'a pas besoin d'équivalent : c'est
   * toujours la DERNIÈRE phase de son chemin, son score est calculé et transmis directement à la
   * clôture de l'exercice, jamais relu à une phase ultérieure. */
  scoreExtractionExercice: number | null;
  extractionRevele: boolean;
  scorePossibiliteExercice: number | null;
  possibiliteRevele: boolean;
  resultats: ResultatExerciceEquationDroite[];
  terminee: boolean;
}

/** Réponse composée de l'écran fusionné (partie A) — réexportée pour les composants React, même
 * principe que `ReponseCoefficients` ci-dessus. */
export type { ReponsePossibiliteCoefficients };
