import type { ExerciceContenanceObjets } from "../core6e/contenanceObjets.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen83`. Chaîne FIXE de 5 écrans pour tous les objets :
 * 1. `modele` — choisir la formule de la contenance (choix fermé, une tentative) ;
 * 2. `poser` — bornes a, b et [f(x)]² (pot : f(x) d'abord, à partir des diamètres) ;
 * 3. `calculer` — V en cm³ ;
 * 4. `convertir` — contenance en L ou en cL ;
 * 5. `transfert` — hauteur du liquide, nombre de récipients (champ) ou comparaison (choix fermé).
 */

export type PhaseContenance = "modele" | "poser" | "calculer" | "convertir" | "transfert";

export const PHASES_CONTENANCE: PhaseContenance[] = ["modele", "poser", "calculer", "convertir", "transfert"];

export function phaseApres(phase: PhaseContenance): PhaseContenance | "termine" {
  const i = PHASES_CONTENANCE.indexOf(phase);
  return i < PHASES_CONTENANCE.length - 1 ? PHASES_CONTENANCE[i + 1] : "termine";
}

/** Écrans à choix fermé (une seule tentative). */
export function estPhaseChoix(exercice: ExerciceContenanceObjets, phase: PhaseContenance): boolean {
  return phase === "modele" || (phase === "transfert" && exercice.transfert === "comparer");
}

export interface EtatSessionContenance {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceContenanceObjets;
  exerciceCourant: ExerciceContenanceObjets;
  phase: PhaseContenance;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseContenance, boolean>>;
  aidePartiels: Partial<Record<PhaseContenance, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
