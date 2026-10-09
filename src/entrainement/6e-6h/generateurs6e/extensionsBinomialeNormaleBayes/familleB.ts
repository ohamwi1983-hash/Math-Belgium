import type { ContexteBinomialeA, TypeQuestionBinomialeA } from "../../core6e/binomialeSequenceOrdonnee.types";
import type { ExerciceExtB } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { construireAvecTypeQuestion } from "../binomialeSequenceOrdonnee/familleA";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération famille B ("Binomial classique étendu") pour `6gen52`. RÉUTILISE
 * INTÉGRALEMENT `construireAvecTypeQuestion` de `generateurs6e/binomialeSequenceOrdonnee/familleA.ts`
 * (`6gen48`/`6gen50` — fonction EXPLICITEMENT documentée dans son propre en-tête comme pensée pour
 * cette réutilisation, section "CONTRAT DE RÉUTILISATION") : la logique "identifier la stratégie —
 * terme unique/somme/complément — puis calculer" n'est PAS réimplémentée ici, seul le `contexte`
 * (banque `6gen52` PROPRE : équipe sportive, personnel hospitalier) est substitué. Aucun écran
 * d'espérance supplémentaire ici (contrairement à `6gen50` famille B) — spec `6gen52` : "2-3 écrans",
 * exactement le patron `6gen48` sans extension.
 */

const CANDIDATS_N_B: readonly number[] = [6, 7, 8, 9, 10];
const CANDIDATS_P_B: readonly number[] = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.65, 0.7];
const TYPES_QUESTION: readonly TypeQuestionBinomialeA[] = ["exactement", "auMoins", "auPlus", "aucun", "tous"];

const CONTEXTES_B: readonly ContexteBinomialeA[] = [
  { id: "equipeSportive", texte: "Dans une équipe sportive, chaque joueur convoqué a, indépendamment des autres, la même probabilité de terminer le match sans faute.", labelSucces: "termine le match sans faute" },
  { id: "personnelHospitalier", texte: "Dans un grand hôpital, on tire au hasard, indépendamment les uns des autres, plusieurs membres du personnel parmi un très grand effectif.", labelSucces: "est de garde ce jour-là" },
];

export { CONTEXTES_B };

/** Construction déterministe (`n`/`p`/`typeQuestion` fixés) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. Délègue tout le calcul binomial à `construireAvecTypeQuestion`
 * (`6gen48`) puis substitue `contexte` (banque `6gen52`). */
export function construireFamilleBAvecTypeQuestion(n: number, p: number, typeQuestion: TypeQuestionBinomialeA, contexte?: ContexteBinomialeA): ExerciceExtB {
  const base = construireAvecTypeQuestion(n, p, typeQuestion);
  return { famille: "B", contexte: contexte ?? tirerParmi(CONTEXTES_B), n: base.n, p: base.p, k: base.k, typeQuestion: base.typeQuestion, strategie: base.strategie, termesACalculer: base.termesACalculer, valeursTermes: base.valeursTermes, resultatFinal: base.resultatFinal };
}

export function construireFamilleB(): ExerciceExtB {
  const n = tirerParmi(CANDIDATS_N_B);
  const p = tirerParmi(CANDIDATS_P_B);
  const typeQuestion = tirerParmi(TYPES_QUESTION);
  return construireFamilleBAvecTypeQuestion(n, p, typeQuestion);
}
