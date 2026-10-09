import type { ExerciceLoiBinomiale } from "../core6e/loiBinomiale.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen50`. Nombre d'écrans VARIABLE selon la famille ET,
 * pour la famille B, selon la STRATÉGIE réutilisée de `6gen48` — mirroir EXACT du patron
 * `typesBinomialeSequenceOrdonnee.ts` (6gen48) : la stratégie est encodée DIRECTEMENT dans le nom de
 * la phase (`bTermeUniqueEcran1` vs `bSommeEcran1` vs `bComplementEcran1`), jamais lue depuis
 * `exercice.strategie` dans `phaseApres` — celui-ci reste une fonction PURE de la phase.
 *
 * - Famille A : 2 écrans FIXES (`aEcran1` identification n/p, `aEcran2` checklist Bernoulli).
 * - Famille B : 2 écrans de calcul (`termeUnique`) ou 3 (`somme`/`complement`), PUIS TOUJOURS 1
 *   écran supplémentaire "espérance" (`bXxxEsperance`) — donc 3 écrans au total si `termeUnique`, 4
 *   si `somme`/`complement`.
 * - Famille C : 3 écrans FIXES (`cEcran1` poser, `cEcran2` isoler, `cEcran3` résoudre via log).
 */

export type PhaseLoiBinomiale =
  | "aEcran1"
  | "aEcran2"
  | "bTermeUniqueEcran1"
  | "bTermeUniqueEcran2"
  | "bTermeUniqueEsperance"
  | "bSommeEcran1"
  | "bSommeEcran2"
  | "bSommeEcran3"
  | "bSommeEsperance"
  | "bComplementEcran1"
  | "bComplementEcran2"
  | "bComplementEcran3"
  | "bComplementEsperance"
  | "cEcran1"
  | "cEcran2"
  | "cEcran3";

export function phaseInitiale(exercice: ExerciceLoiBinomiale): PhaseLoiBinomiale {
  if (exercice.famille === "A") return "aEcran1";
  if (exercice.famille === "C") return "cEcran1";
  switch (exercice.strategie) {
    case "termeUnique":
      return "bTermeUniqueEcran1";
    case "somme":
      return "bSommeEcran1";
    case "complement":
      return "bComplementEcran1";
  }
}

export function phaseApres(phase: PhaseLoiBinomiale): PhaseLoiBinomiale | "termine" {
  switch (phase) {
    case "aEcran1":
      return "aEcran2";
    case "aEcran2":
      return "termine";
    case "bTermeUniqueEcran1":
      return "bTermeUniqueEcran2";
    case "bTermeUniqueEcran2":
      return "bTermeUniqueEsperance";
    case "bTermeUniqueEsperance":
      return "termine";
    case "bSommeEcran1":
      return "bSommeEcran2";
    case "bSommeEcran2":
      return "bSommeEcran3";
    case "bSommeEcran3":
      return "bSommeEsperance";
    case "bSommeEsperance":
      return "termine";
    case "bComplementEcran1":
      return "bComplementEcran2";
    case "bComplementEcran2":
      return "bComplementEcran3";
    case "bComplementEcran3":
      return "bComplementEsperance";
    case "bComplementEsperance":
      return "termine";
    case "cEcran1":
      return "cEcran2";
    case "cEcran2":
      return "cEcran3";
    case "cEcran3":
      return "termine";
  }
}

/** Liste ORDONNÉE des phases réellement traversées par CET exercice précis — mirroir 6gen48. */
export function phasesPourExercice(exercice: ExerciceLoiBinomiale): PhaseLoiBinomiale[] {
  const phases: PhaseLoiBinomiale[] = [];
  let phase: PhaseLoiBinomiale | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

export interface ResultatExerciceLoiBinomiale {
  exercice: ExerciceLoiBinomiale;
  scores: Partial<Record<PhaseLoiBinomiale, number>>;
}

export interface EtatSessionLoiBinomiale {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceLoiBinomiale;
  exerciceCourant: ExerciceLoiBinomiale;
  phase: PhaseLoiBinomiale;
  /** Identifiant STRICTEMENT croissant, incrémenté à chaque nouvel exercice tiré — mirroir
   * `generationId` de `typesBinomialeSequenceOrdonnee.ts` (6gen48), qui corrige EXACTEMENT le même
   * bug que celui documenté là-bas : la famille B ici a, elle aussi, un nombre de CHAMPS variable
   * (`termesACalculer.length`) à écran de départ constant selon la stratégie (`bSommeEcran1` peut
   * porter 2 ou 3 champs selon l'exercice) — `key={phase}` seul ne suffit donc PAS à garantir un
   * remontage React entre 2 exercices consécutifs de même stratégie mais de longueur différente.
   * `App6gen50.tsx` DOIT l'utiliser comme partie de la clé React
   * (`key={`${generationId}-${phase}`}`), jamais `phase` seul. */
  generationId: number;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseLoiBinomiale, number>>;
  indexExercice: number;
  resultats: ResultatExerciceLoiBinomiale[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
