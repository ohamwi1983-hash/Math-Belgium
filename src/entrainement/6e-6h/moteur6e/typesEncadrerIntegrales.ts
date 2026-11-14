import type { ExerciceEncadrerIntegrales } from "../core6e/encadrerIntegrales.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen79` « Comparer et encadrer des intégrales ». La chaîne
 * d'écrans dépend de la variante (et, pour `signe`, de l'ordre des bornes) :
 * - `signe` : `signeF` (signe de f sur l'intervalle) → [`signeOrdonne` (positivité, bornes dans
 *   l'ordre croissant) si les bornes sont échangées] → `conclusionSigne` ;
 * - `comparer` : `inegalite` (f ≤ g, f ≥ g ou changement de signe) → `conclusionComparaison` ;
 * - `encadrer` : `m` → `M` → `bornes` (m(b − a) et M(b − a)) ;
 * - `moyenne` : `mM` → `bornesIntegrale` → `bornesMoyenne`.
 * Les écrans de verdict sont des choix fermés (UNE tentative) ; les autres, des champs libres.
 */

export type PhaseEncadrerIntegrales =
  | "signeF"
  | "signeOrdonne"
  | "conclusionSigne"
  | "inegalite"
  | "conclusionComparaison"
  | "m"
  | "M"
  | "bornes"
  | "mM"
  | "bornesIntegrale"
  | "bornesMoyenne";

export type PhaseChampsEncadrer = "m" | "M" | "bornes" | "mM" | "bornesIntegrale" | "bornesMoyenne";
export type PhaseChoixEncadrer = Exclude<PhaseEncadrerIntegrales, PhaseChampsEncadrer>;

export function phasesExercice(e: ExerciceEncadrerIntegrales): PhaseEncadrerIntegrales[] {
  switch (e.variante) {
    case "signe":
      return e.inverse ? ["signeF", "signeOrdonne", "conclusionSigne"] : ["signeF", "conclusionSigne"];
    case "comparer":
      return ["inegalite", "conclusionComparaison"];
    case "encadrer":
      return ["m", "M", "bornes"];
    case "moyenne":
      return ["mM", "bornesIntegrale", "bornesMoyenne"];
  }
}

const PHASES_CHOIX: PhaseEncadrerIntegrales[] = ["signeF", "signeOrdonne", "conclusionSigne", "inegalite", "conclusionComparaison"];

/** Écrans à choix fermé (une seule tentative) — les autres sont des champs libres. */
export function estPhaseChoix(phase: PhaseEncadrerIntegrales): phase is PhaseChoixEncadrer {
  return PHASES_CHOIX.includes(phase);
}

export interface EtatSessionEncadrerIntegrales {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceEncadrerIntegrales;
  exerciceCourant: ExerciceEncadrerIntegrales;
  phase: PhaseEncadrerIntegrales;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseEncadrerIntegrales, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
