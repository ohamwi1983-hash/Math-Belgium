// Copie 5e (6h) de `5e-4h/moteur5e/typesTroisTermes.ts` (56gen5 ← 5gen46, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { analyser } from "../core/troisTermes.types";
import type { ExerciceTroisTermes } from "../core/troisTermes.types";
import type { ReglagesSession5e } from "../../../../5e-4h/core5e/session5e.types";
import type { EtatEtapeTentatives } from "../../../../5e-4h/moteur/etapeTentatives";

/**
 * Couche B (5e) — types de session de `5gen46` « Trois termes consécutifs ». Quatre écrans :
 * - `relation` : choix fermé (UNE seule tentative) entre 2b = a + c, b² = a·c et trois distracteurs ;
 * - `equation` : équation réduite « … = 0 » (champ libre, vérifiée à un facteur non nul près) ;
 * - `solutions` : valeur(s) de x qui conviennent, liste à compléter ou « aucune valeur » ;
 * - `termes` : pour chaque valeur qui convient, a, b, c et la raison.
 * Quand aucune valeur ne convient, l'exercice s'arrête après `solutions` (l'écran `termes` est
 * alors « sans objet » dans la barre de progression, qui garde toujours QUATRE puces : leur
 * nombre ne doit pas trahir le verdict avant l'écran `solutions`).
 */

export type PhaseTroisTermes = "relation" | "equation" | "solutions" | "termes";

export const PHASES_TROIS_TERMES: PhaseTroisTermes[] = ["relation", "equation", "solutions", "termes"];

/** Écrans réellement joués (sans `termes` si aucune valeur ne convient). */
export function phasesJouees(e: ExerciceTroisTermes): PhaseTroisTermes[] {
  return analyser(e).valables.length > 0 ? PHASES_TROIS_TERMES : PHASES_TROIS_TERMES.slice(0, 3);
}

export function phaseApres(e: ExerciceTroisTermes, phase: PhaseTroisTermes): PhaseTroisTermes | "termine" {
  const phases = phasesJouees(e);
  const i = phases.indexOf(phase);
  return i < phases.length - 1 ? phases[i + 1] : "termine";
}

/** Choix fermé : une seule tentative (décision de l'utilisateur) ; champs libres : réglage de session. */
export function tentativesMaxPhase(phase: PhaseTroisTermes, tentativesChampsLibres: number): number {
  return phase === "relation" ? 1 : tentativesChampsLibres;
}

/** Réponse « aucune valeur ne convient » à l'écran `solutions`. */
export const REPONSE_AUCUNE = "__aucune__";

export interface EtatSessionTroisTermes {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceTroisTermes;
  exerciceCourant: ExerciceTroisTermes;
  phase: PhaseTroisTermes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseTroisTermes, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
