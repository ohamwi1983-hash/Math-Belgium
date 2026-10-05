import type { ExerciceFonctionReference, GenerateurExerciceFonctionReference } from "../core/fonctionsReference.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Séquence à 2 phases (spec-fonctions-reference.md section 3) : `reconnaissance` (étape 0, choix
 * parmi les 6 familles, jamais sautée — contrairement aux phases conditionnelles de l'exercice 1)
 * puis `exercice` (étape 1, curseurs + équation, DEUX notes indépendantes — même principe que
 * "Transformations graphiques" chapitre 1, dont ce générateur reprend le mécanisme du bouton
 * "Aide"/etapeTentatives.ts, voir sessionFonctionsReference.ts).
 */
export type PhaseFonctionReference = "reconnaissance" | "exercice";

/**
 * `equationAideUtilisee`/`curseursAideUtilisee` — PAS le flag partagé
 * `EtatSessionFonctionReference.aideUtilisee` tel quel : sa valeur AU MOMENT PRÉCIS où cette note
 * précise s'est close (même valeur que celle réellement appliquée au calcul du score de cette
 * note, voir `soumettreReponse`) — une note close AVANT l'activation de l'aide reste `false` même
 * si l'aide est activée plus tard dans le même exercice. Nécessaire pour `statutRecap`
 * (`components/LigneRecap.tsx`, `promptuniformisationrecap4e.md`) — le flag partagé seul aurait
 * classé à tort une note non pénalisée comme "orange" (même piège déjà corrigé pour
 * `ResultatExerciceTransformationGraphique`, chapitre 1).
 */
export interface ResultatExerciceFonctionReference {
  scoreReconnaissance: number;
  reconnaissanceRevele: boolean;
  scoreEquation: number;
  equationRevele: boolean;
  equationAideUtilisee: boolean;
  scoreCurseurs: number;
  curseursRevele: boolean;
  curseursAideUtilisee: boolean;
}

export interface EtatSessionFonctionReference {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceFonctionReference;
  indexExercice: number;
  exerciceCourant: ExerciceFonctionReference;
  phase: PhaseFonctionReference;
  etapeReconnaissance: EtatEtapeTentatives;
  etapeEquation: EtatEtapeTentatives;
  etapeCurseurs: EtatEtapeTentatives;
  /** Bouton "Aide" : usable uniquement en phase "exercice" (section 2-3 de la spec, comme le
   * chapitre 1) — jamais pendant la reconnaissance, et jamais de pénalité sur la note
   * "reconnaissance", qui est toujours close avant que l'aide ne devienne accessible. Révélation à
   * sens unique, ×0,5 sur les DEUX notes de l'écran "exercice", appliqué à chacune au moment précis
   * de sa propre clôture. */
  aideUtilisee: boolean;
  /** Fixé (jamais affecté par l'aide) dès que etapeReconnaissance se clôt ; `null` avant. */
  scoreReconnaissanceExercice: number | null;
  scoreEquationExercice: number | null;
  scoreCurseursExercice: number | null;
  /** `aideUtilisee` figé au moment PRÉCIS où `etapeEquation`/`etapeCurseurs` se clôt (même valeur
   * que celle réellement appliquée au score de cette note) — jamais relu depuis `aideUtilisee`
   * après coup, qui a pu changer entre-temps si l'autre note s'est close plus tard. */
  equationAideAppliquee: boolean;
  curseursAideAppliquee: boolean;
  resultats: ResultatExerciceFonctionReference[];
  terminee: boolean;
}
