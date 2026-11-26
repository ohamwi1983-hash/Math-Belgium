// Copie 5e (6h) de `5e-4h/moteur5e/typesSommesTermes.ts` (56gen4 ← 5gen45, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ExerciceSommesTermes } from "../core/sommesTermes.types";
import type { ReglagesSession5e } from "../../../../5e-4h/core5e/session5e.types";
import type { EtatEtapeTentatives } from "../../../../5e-4h/moteur/etapeTentatives";

/**
 * Couche B (5e) — types de session de `5gen45` « Sommes de termes consécutifs ». Trois écrans par
 * exercice, tous à champs libres (aucun choix fermé) :
 * - arith-indices : `nombreTermes` → `termesExtremes` (uₚ et uₙ) → `somme` ;
 * - arith-extension (liste) : `raison` → `nombreTermes` → `somme` ;
 * - arith-extension (impairs/pairs) : `formuleGenerale` → `nombreTermes` → `somme` ;
 * - arith-extension (multiples) : `bornesMultiples` → `nombreTermes` → `somme` ;
 * - geom-indices : `nombreTermes` → `premierTerme` (uₚ) → `somme` ;
 * - geom-extension : `raison` → `nombreTermes` → `somme`.
 */

export type PhaseSommesTermes = "nombreTermes" | "termesExtremes" | "premierTerme" | "raison" | "formuleGenerale" | "bornesMultiples" | "somme";

export function phasesPourExercice(e: ExerciceSommesTermes): PhaseSommesTermes[] {
  switch (e.variante) {
    case "arith-indices":
      return ["nombreTermes", "termesExtremes", "somme"];
    case "arith-extension":
      if (e.sousCas === "naturels") return ["formuleGenerale", "nombreTermes", "somme"];
      if (e.sousCas === "multiples") return ["bornesMultiples", "nombreTermes", "somme"];
      return ["raison", "nombreTermes", "somme"];
    case "geom-indices":
      return ["nombreTermes", "premierTerme", "somme"];
    case "geom-extension":
      return ["raison", "nombreTermes", "somme"];
  }
}

export function phaseApres(e: ExerciceSommesTermes, phase: PhaseSommesTermes): PhaseSommesTermes | "termine" {
  const phases = phasesPourExercice(e);
  const i = phases.indexOf(phase);
  return i < phases.length - 1 ? phases[i + 1] : "termine";
}

export interface EtatSessionSommesTermes {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceSommesTermes;
  exerciceCourant: ExerciceSommesTermes;
  phase: PhaseSommesTermes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseSommesTermes, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
