import type { ExerciceGrandsNombres } from "../core6e/grandsNombresLog";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen92` « Grands nombres et logarithme décimal ». Chaîne
 * d'écrans propre à chaque variante :
 * - chiffres : `logPuissance` (n·log a) → `partieEntiere` → `nombreChiffres` ;
 * - comparer (logs) : `logsDeux` (deux logarithmes) → `verdict` (choix fermé) ;
 * - comparer (exact) : `memeExposant` (deux bases d'exposant commun) → `verdict` (choix fermé) ;
 * - premier chiffre : `logPuissance` → `scientifique` (mantisse, exposant) → `premierChiffre`
 *   (premier chiffre, nombre de chiffres) ;
 * - temps (durée) : `logOperations` → `dureeSecondes` → `dureeAnnees` ;
 * - temps (taille) : `operations` (nombre d'opérations disponibles) → `borne` → `plusGrandN`.
 */

export type PhaseGrandsNombres =
  | "logPuissance"
  | "partieEntiere"
  | "nombreChiffres"
  | "logsDeux"
  | "memeExposant"
  | "verdict"
  | "scientifique"
  | "premierChiffre"
  | "logOperations"
  | "dureeSecondes"
  | "dureeAnnees"
  | "operations"
  | "borne"
  | "plusGrandN";

export function phasesPourExercice(e: ExerciceGrandsNombres): PhaseGrandsNombres[] {
  switch (e.variante) {
    case "chiffres":
      return ["logPuissance", "partieEntiere", "nombreChiffres"];
    case "comparer":
      return e.sousCas === "logs" ? ["logsDeux", "verdict"] : ["memeExposant", "verdict"];
    case "premier-chiffre":
      return ["logPuissance", "scientifique", "premierChiffre"];
    case "temps":
      return e.sousCas === "duree" ? ["logOperations", "dureeSecondes", "dureeAnnees"] : ["operations", "borne", "plusGrandN"];
  }
}

export function phaseApres(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): PhaseGrandsNombres | "termine" {
  const phases = phasesPourExercice(e);
  const i = phases.indexOf(phase);
  return i < phases.length - 1 ? phases[i + 1] : "termine";
}

/** Seul écran à choix fermé : une seule tentative (règle permanente du site). */
export function estPhaseChoix(phase: PhaseGrandsNombres): boolean {
  return phase === "verdict";
}

export interface EtatSessionGrandsNombres {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceGrandsNombres;
  exerciceCourant: ExerciceGrandsNombres;
  phase: PhaseGrandsNombres;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseGrandsNombres, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
