/**
 * Couche B (5e) — types pour 5gen33 ("Contexte économique"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Séquence d'écrans FIXE dès le tirage, dépend UNIQUEMENT de `exercice.famille` (jamais une
 * branche réactive dépendant d'une réponse élève) — même patron que
 * `moteur5e/typesEtudeLocale.ts::ordreEcransEtudeLocale` (5gen29).
 *
 * Le bonus a 4 itérations de dichotomie représentées par 4 écrans LITTÉRALEMENT DISTINCTS
 * ("iteration0".."iteration3") plutôt qu'un unique écran "iteration" + un compteur séparé — choix
 * délibéré : réutilise tel quel le mécanisme `ecranApres`/`indexOf` déjà établi (5gen29), et donne
 * gratuitement une clé distincte par itération pour le suivi aide/révélation par écran
 * (`aideParPhase` côté `App5gen33.tsx`, même patron que tous les autres générateurs 5e) — un seul
 * écran "iteration" répété aurait écrasé cet historique à chaque passage.
 */
import type { ExerciceContexteEconomique } from "../core5e/contexteEconomique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type EcranContexteEconomiqueA = "coutMarginalDiscret" | "deriveeSymbolique" | "deriveeValeur" | "comparaisonEcart" | "extremum";

export type EcranContexteEconomiqueB =
  | "recetteTotale"
  | "marginales"
  | "resoudreEgaliteMarginales"
  | "beneficeFormule"
  | "beneficeDerivee"
  | "tableauSigneBenefice"
  | "confirmationCoherence"
  | "beneficeMaximum";

export type EcranContexteEconomiqueBonus = "poserEquationReduite" | "iteration0" | "iteration1" | "iteration2" | "iteration3" | "racineApprochee";

export type EcranContexteEconomique = EcranContexteEconomiqueA | EcranContexteEconomiqueB | EcranContexteEconomiqueBonus;

const ORDRE_A: EcranContexteEconomiqueA[] = ["coutMarginalDiscret", "deriveeSymbolique", "deriveeValeur", "comparaisonEcart", "extremum"];
const ORDRE_B: EcranContexteEconomiqueB[] = [
  "recetteTotale",
  "marginales",
  "resoudreEgaliteMarginales",
  "beneficeFormule",
  "beneficeDerivee",
  "tableauSigneBenefice",
  "confirmationCoherence",
  "beneficeMaximum",
];
const ORDRE_BONUS: EcranContexteEconomiqueBonus[] = ["poserEquationReduite", "iteration0", "iteration1", "iteration2", "iteration3", "racineApprochee"];

const ECRANS_ITERATION: EcranContexteEconomiqueBonus[] = ["iteration0", "iteration1", "iteration2", "iteration3"];

/** Index (0 à 3) de l'itération représentée par cet écran — utilisé pour indexer
 * `exercice.iterations`. */
export function indexIteration(ecran: EcranContexteEconomique): number {
  const i = ECRANS_ITERATION.indexOf(ecran as EcranContexteEconomiqueBonus);
  if (i === -1) throw new Error(`indexIteration : "${ecran}" n'est pas un écran d'itération`);
  return i;
}

export function ordreEcransContexteEconomique(exercice: ExerciceContexteEconomique): EcranContexteEconomique[] {
  if (exercice.famille === "A") return ORDRE_A;
  if (exercice.famille === "B") return ORDRE_B;
  return ORDRE_BONUS;
}

export function ecranInitial(exercice: ExerciceContexteEconomique): EcranContexteEconomique {
  return ordreEcransContexteEconomique(exercice)[0];
}

export function ecranApres(exercice: ExerciceContexteEconomique, ecran: EcranContexteEconomique): EcranContexteEconomique | "termine" {
  const ordre = ordreEcransContexteEconomique(exercice);
  const index = ordre.indexOf(ecran);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceContexteEconomique {
  exercice: ExerciceContexteEconomique;
  /** Indexé par écran RÉELLEMENT traversé — voir `ordreEcransContexteEconomique`. */
  scores: Partial<Record<EcranContexteEconomique, number>>;
}

export interface EtatSessionContexteEconomique {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceContexteEconomique;
  exerciceCourant: ExerciceContexteEconomique;
  phase: EcranContexteEconomique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranContexteEconomique, number>>;
  indexExercice: number;
  resultats: ResultatExerciceContexteEconomique[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
