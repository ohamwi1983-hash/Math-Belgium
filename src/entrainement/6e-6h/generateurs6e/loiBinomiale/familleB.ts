import type { ContexteBinomialeA, TypeQuestionBinomialeA } from "../../core6e/binomialeSequenceOrdonnee.types";
import type { ExerciceLoiBinomialeB } from "../../core6e/loiBinomiale.types";
import { construireAvecTypeQuestion } from "../binomialeSequenceOrdonnee/familleA";
import { tirerParmi } from "./aleatoire";
import { CONTEXTES_B } from "./contextes";

/**
 * Couche A (6e) — génération famille B ("Calculs directs") pour `6gen50`. RÉUTILISE INTÉGRALEMENT
 * `construireAvecTypeQuestion` de `6gen48` (`generateurs6e/binomialeSequenceOrdonnee/familleA.ts`,
 * fonction PENSÉE pour cette réutilisation, voir son en-tête "CONTRAT DE RÉUTILISATION — `6gen50`")
 * — la logique "identifier la stratégie → calculer → combiner" n'est PAS réimplémentée ici, seul le
 * `contexte` (banque propre à `6gen50`) est substitué, et l'espérance `E(X)=n·p` est ajoutée.
 */

export const CANDIDATS_N_B: readonly number[] = [5, 6, 7, 8, 9, 10];
export const CANDIDATS_P_B: readonly number[] = [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9];
const TYPES_QUESTION: readonly TypeQuestionBinomialeA[] = ["exactement", "auMoins", "auPlus", "aucun", "tous"];

export { CONTEXTES_B };

/** Construction déterministe (`n`/`p`/`typeQuestion` fixés) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. Délègue tout le calcul binomial à `construireAvecTypeQuestion` (6gen48)
 * puis substitue `contexte` (banque `6gen50`) et ajoute `esperance`. */
export function construireFamilleB(n: number, p: number, typeQuestion: TypeQuestionBinomialeA, contexte?: ContexteBinomialeA): ExerciceLoiBinomialeB {
  const base = construireAvecTypeQuestion(n, p, typeQuestion);
  return { ...base, famille: "B", contexte: contexte ?? tirerParmi(CONTEXTES_B), esperance: n * p };
}

export function genererFamilleB(): ExerciceLoiBinomialeB {
  const n = tirerParmi(CANDIDATS_N_B);
  const p = tirerParmi(CANDIDATS_P_B);
  const typeQuestion = tirerParmi(TYPES_QUESTION);
  return construireFamilleB(n, p, typeQuestion);
}
