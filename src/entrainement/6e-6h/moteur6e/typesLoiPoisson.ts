import type { ExerciceLoiPoisson } from "../core6e/loiPoisson.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen53`. Nombre d'écrans VARIABLE selon la famille ET,
 * pour la famille B, selon la STRATÉGIE — mirroir `typesLoiBinomiale.ts` (6gen50)/
 * `typesBinomialeSequenceOrdonnee.ts` (6gen48) : la stratégie est encodée DIRECTEMENT dans le nom
 * de la phase (`bTermeUniqueEcran1` vs `bSommeEcran1` vs `bComplementEcran1`), jamais lue depuis
 * `exercice.strategie` dans `phaseApres` — celui-ci reste une fonction PURE de la phase.
 *
 * - Famille A : 3 écrans FIXES (`aEcran1` checklist 3 conditions, `aEcran2` calcul de λ, `aEcran3`
 *   calcul de P(X=k)).
 * - Famille B : `bXxxEcran1` (déterminer λ, TOUJOURS présent quelle que soit la stratégie — d'où le
 *   nom de phase différent PAR stratégie dès ce tout premier écran, comme `6gen50`/`6gen48` le font
 *   déjà pour LEUR tout premier écran). Puis, SELON `exercice.strategie` :
 *   - `"termeUnique"` : UN SEUL écran de plus (`bTermeUniqueEcranFinal`, identification ET calcul
 *     FUSIONNÉS — décision de conception documentée dans `core6e/loiPoisson.types.ts` et
 *     `docs/historique-6e.md`) → 2 écrans au total.
 *   - `"somme"`/`"complement"` : DEUX écrans de plus, séparés (`bXxxEcran2` identification,
 *     `bXxxEcran3` calcul final) → 3 écrans au total.
 */

export type PhaseLoiPoisson =
  | "aEcran1"
  | "aEcran2"
  | "aEcran3"
  | "bTermeUniqueEcran1"
  | "bTermeUniqueEcranFinal"
  | "bSommeEcran1"
  | "bSommeEcran2"
  | "bSommeEcran3"
  | "bComplementEcran1"
  | "bComplementEcran2"
  | "bComplementEcran3";

export function phaseInitiale(exercice: ExerciceLoiPoisson): PhaseLoiPoisson {
  if (exercice.famille === "A") return "aEcran1";
  switch (exercice.strategie) {
    case "termeUnique":
      return "bTermeUniqueEcran1";
    case "somme":
      return "bSommeEcran1";
    case "complement":
      return "bComplementEcran1";
  }
}

export function phaseApres(phase: PhaseLoiPoisson): PhaseLoiPoisson | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "aEcran3";
    case "aEcran3":
      return "termine";
    case "bTermeUniqueEcran1":
      return "bTermeUniqueEcranFinal";
    case "bTermeUniqueEcranFinal":
      return "termine";
    case "bSommeEcran1":
      return "bSommeEcran2";
    case "bSommeEcran2":
      return "bSommeEcran3";
    case "bSommeEcran3":
      return "termine";
    case "bComplementEcran1":
      return "bComplementEcran2";
    case "bComplementEcran2":
      return "bComplementEcran3";
    case "bComplementEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen48/50. */
export function phasesPourExercice(exercice: ExerciceLoiPoisson): PhaseLoiPoisson[] {
  const phases: PhaseLoiPoisson[] = [];
  let phase: PhaseLoiPoisson | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceLoiPoisson {
  exercice: ExerciceLoiPoisson;
  scores: Partial<Record<PhaseLoiPoisson, number>>;
}

export interface EtatSessionLoiPoisson {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLoiPoisson;
  exerciceCourant: ExerciceLoiPoisson;
  phase: PhaseLoiPoisson;
  /** Identifiant STRICTEMENT croissant, incrémenté à chaque nouvel exercice tiré — mirroir
   * `generationId` de `typesLoiBinomiale.ts` (6gen50) : la famille B ici a, elle aussi, un nombre de
   * CHAMPS variable (`termesACalculer.length`) à écran de départ constant selon la stratégie.
   * `App6gen53.tsx` DOIT l'utiliser comme partie de la clé React (`key={`${generationId}-${phase}`}`),
   * jamais `phase` seul. */
  generationId: number;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseLoiPoisson, number>>;
  indexExercice: number;
  resultats: ResultatExerciceLoiPoisson[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
