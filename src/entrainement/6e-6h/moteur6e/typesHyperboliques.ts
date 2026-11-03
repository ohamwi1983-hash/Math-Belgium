/**
 * Couche B (6e) — types pour `6gen19`. 4 familles STRUCTURELLEMENT DISJOINTES (1 ou 2 écrans
 * chacune, FIXE par famille) — `phaseInitiale`/`phaseApres` dispatchent sur `exercice.famille`,
 * même principe que `typesDomaineDeriveeLogarithme.ts` (`6gen16`).
 */
import type { ExerciceHyperboliques } from "../core6e/hyperboliques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/** Famille B : un seul écran "bValeurs" (la ou les valeurs EXACTES — l'ancien écran "isoler"
 * symbolique faisait doublon). Famille C : f' puis f'' (l'ancien écran "relation" f''=k²·f était
 * trivial une fois f'' confirmée). */
export type PhaseHyperboliques = "aParite" | "bValeurs" | "cDerivee" | "cDeriveeSeconde" | "dReecriture" | "dLimites";

export function phaseInitiale(exercice: ExerciceHyperboliques): PhaseHyperboliques {
  switch (exercice.famille) {
    case "A":
      return "aParite";
    case "B":
      return "bValeurs";
    case "C":
      return "cDerivee";
    case "D":
      return "dReecriture";
  }
}

export function phaseApres(phase: PhaseHyperboliques): PhaseHyperboliques | "termine" {
  switch (phase) {
    case "aParite":
      return "termine";
    case "bValeurs":
      return "termine";
    case "cDerivee":
      return "cDeriveeSeconde";
    case "cDeriveeSeconde":
      return "termine";
    case "dReecriture":
      return "dLimites";
    case "dLimites":
      return "termine";
  }
}

/** Détail de clôture d'un écran (`revele`/`niveauAide` AU MOMENT PRÉCIS de la clôture, avant que la
 * transition de phase suivante ne remette `niveauAide` à zéro) — jamais dérivé du score. Consommé
 * par `statutRecap` (`components6e/LigneRecap.tsx`). Même principe que `6gen16`/`6gen7` — évite par
 * construction le piège "revele stale" documenté dans CLAUDE.md. */
export interface DetailPhaseHyperboliques {
  revele: boolean;
  niveauAide: number;
}

export type ResultatExerciceHyperboliques =
  | { famille: "A"; exercice: ExerciceHyperboliques; scoreParite: number; details: Partial<Record<PhaseHyperboliques, DetailPhaseHyperboliques>> }
  | { famille: "B"; exercice: ExerciceHyperboliques; scoreValeurs: number; details: Partial<Record<PhaseHyperboliques, DetailPhaseHyperboliques>> }
  | { famille: "C"; exercice: ExerciceHyperboliques; scoreDerivee: number; scoreDeriveeSeconde: number; details: Partial<Record<PhaseHyperboliques, DetailPhaseHyperboliques>> }
  | { famille: "D"; exercice: ExerciceHyperboliques; scoreReecriture: number; scoreLimites: number; details: Partial<Record<PhaseHyperboliques, DetailPhaseHyperboliques>> };

/** Nombre de tentatives PAR ÉCRAN : une seule sur les choix fermés (parité : 3 choix ; limites :
 * 4 combinaisons) — sinon ils se gagnent par élimination ; les écrans à saisie libre gardent le
 * réglage de session. */
export function tentativesMaxPhase(phase: PhaseHyperboliques, tentativesSession: number): number {
  return phase === "aParite" || phase === "dLimites" ? 1 : tentativesSession;
}

export interface EtatSessionHyperboliques {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceHyperboliques;
  exerciceCourant: ExerciceHyperboliques;
  phase: PhaseHyperboliques;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseHyperboliques, number>>;
  detailsPartiels: Partial<Record<PhaseHyperboliques, DetailPhaseHyperboliques>>;
  indexExercice: number;
  resultats: ResultatExerciceHyperboliques[];
  terminee: boolean;
}
