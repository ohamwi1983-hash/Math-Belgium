/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen19 ("Suite récurrente affine et
 * régime permanent"). Séquence fixe à 3 écrans, identique pour les 2 régimes.
 */
import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";
import type { FractionQ } from "../core5e/suitesGeometriques.types";
import { fractionQVersNombre } from "../generateurs5e/suitesGeometriques/fraction";
import type { PhaseSuiteRecurrenteAffine } from "../moteur5e/typesSuiteRecurrenteAffine";

/** Fraction irréductible en LaTeX — entier si `den===1`, sinon fraction (signe porté par `num`) —
 * jamais un décimal (`prompt-chapitre-suites-audit-formatage.md`, même bug que 5gen15/16). */
function fractionQVersLatex(f: FractionQ): string {
  if (f.den === 1) return `${f.num}`;
  return f.num < 0 ? `-\\dfrac{${-f.num}}{${f.den}}` : `\\dfrac{${f.num}}{${f.den}}`;
}

export function consigneGenerale(exercice: ExerciceSuiteRecurrenteAffine): string {
  return exercice.phraseEnonce;
}

export function consignePoserRecurrence(exercice: ExerciceSuiteRecurrenteAffine): string {
  return `On note ${exercice.variableGrandeur}ₙ la valeur après n étapes, avec ${exercice.variableGrandeur}₁=${exercice.u1}. Complète : ${exercice.variableGrandeur}ₙ₊₁ = ... en fonction de ${exercice.variableGrandeur}ₙ (utilise "x" pour représenter ${exercice.variableGrandeur}ₙ).`;
}

export function consigneRegimePermanent(_exercice: ExerciceSuiteRecurrenteAffine): string {
  return "Cette suite a-t-elle un régime permanent (une valeur limite L vers laquelle elle se stabilise) ? Si oui, calcule-le (arrondis au centième près).";
}

export function consigneTermesSuccessifs(exercice: ExerciceSuiteRecurrenteAffine): string {
  return `Calcule les 3 valeurs suivantes de la suite (${exercice.variableGrandeur}₂, ${exercice.variableGrandeur}₃, ${exercice.variableGrandeur}₄) à partir de ${exercice.variableGrandeur}₁=${exercice.u1} (arrondis au centième près).`;
}

/** LaTeX PUR sur toute phase (même motif déjà établi sur 5gen15/16, voir en-tête de
 * `formatSuiteGeometrique.ts`) — rendu via `<Katex block />`, jamais un `<p>` brut. */
export function texteAideNiveau1(exercice: ExerciceSuiteRecurrenteAffine, phase: "poserRecurrence" | "regimePermanent" | "termesSuccessifs"): string {
  switch (phase) {
    case "poserRecurrence":
      return "\\text{Repère le facteur multiplicatif appliqué à chaque étape (}a\\text{), puis la quantité fixe qui s'ajoute — ou se retranche si elle est négative — à chaque étape (}b\\text{).}";
    case "regimePermanent":
      return `\\text{À l'équilibre (régime permanent), la valeur ne change plus d'une étape à l'autre : } ${exercice.variableGrandeur}_{n+1}=${exercice.variableGrandeur}_n=L. \\text{ Mais cet équilibre n'existe que si } |a|<1 \\text{ — vérifie-le en premier.}`;
    case "termesSuccessifs":
      return "\\text{Applique la relation de récurrence trouvée à l'écran 1, en partant de la valeur initiale.}";
  }
}

export function texteAideNiveau2(exercice: ExerciceSuiteRecurrenteAffine, phase: "poserRecurrence" | "regimePermanent" | "termesSuccessifs"): string {
  if (phase === "poserRecurrence") {
    return `${exercice.variableGrandeur}_{n+1}=a\\times ${exercice.variableGrandeur}_n+b \\text{, avec } a=${fractionQVersLatex(exercice.a)} \\text{ et } b=${exercice.b}`;
  }
  if (phase === "regimePermanent") {
    if (exercice.regime === "divergent") {
      const absA = fractionQVersNombre(exercice.a) < 0 ? `-\\left(${fractionQVersLatex(exercice.a)}\\right)` : fractionQVersLatex(exercice.a);
      return `|a|=${absA}\\geq 1 \\Rightarrow \\text{ pas de régime permanent}`;
    }
    return `L=a\\times L+b \\Rightarrow L=\\dfrac{b}{1-a}`;
  }
  return "";
}

// ============================================================================
// Bloc "état actuel" + récapitulatif final — récapitulent, à partir du 2e écran de la séquence
// FIXE (`poserRecurrence → regimePermanent → termesSuccessifs`, jamais de saut), les valeurs déjà
// CONFIRMÉES plus tôt — jamais la saisie brute de l'élève, toujours dérivé PUREMENT de `exercice`
// (même convention "état actuel" que le reste du projet, ex. `formatTermesEtatActuelCELatex`,
// 5gen1). `null` (rien rendu) sur le tout premier écran ("poserRecurrence").
// ============================================================================

/** Terme `b` signé — porte son propre signe plutôt que d'être juxtaposé à un `+` littéral du
 * template (sinon double-signe `+-5` quand `b<0`, cas des contextes divergents). */
function formatTermeB(b: number): string {
  return b < 0 ? `-${-b}` : `+${b}`;
}

/** Relation de récurrence confirmée à l'écran "poserRecurrence" — même formule que l'aide niveau 2
 * de cet écran, mais VOLONTAIREMENT réimplémentée ici (petite duplication assumée) plutôt
 * qu'appelée, réutilisant l'indice `_{n+1}` accolé correctement (jamais `_(n+1)`, qui ne
 * sous-indicerait qu'une parenthèse — voir le label de champ de `EtapePoserRecurrence.tsx`). */
function formatRecurrenceConfirmeeLatex(exercice: ExerciceSuiteRecurrenteAffine): string {
  return `${exercice.variableGrandeur}_{n+1}=${fractionQVersLatex(exercice.a)}\\times ${exercice.variableGrandeur}_n${formatTermeB(exercice.b)}`;
}

/** Régime confirmé à l'écran "regimePermanent" — "L=..." si convergent, jamais une valeur
 * inventée si divergent (n'existe pas). */
export function formatRegimeConfirmeLatex(exercice: ExerciceSuiteRecurrenteAffine): string {
  if (exercice.regime === "divergent") return "L = \\text{n'existe pas}";
  return `L=${fractionQVersLatex(exercice.L as FractionQ)}`;
}

export function formatTermesEtatActuelLatex(exercice: ExerciceSuiteRecurrenteAffine, phase: PhaseSuiteRecurrenteAffine): string[] | null {
  if (phase === "poserRecurrence") return null;
  const termes = [formatRecurrenceConfirmeeLatex(exercice)];
  if (phase === "termesSuccessifs") termes.push(formatRegimeConfirmeLatex(exercice));
  return termes;
}

/** Réponse attendue à un écran donné, pour le récapitulatif final (`ResultatPanelSuiteRecurrenteAffine.tsx`)
 * — en fragments LaTeX ("bloc fitter"), un fragment par valeur pour "termesSuccessifs" (3 valeurs). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceSuiteRecurrenteAffine, phase: PhaseSuiteRecurrenteAffine): string[] {
  switch (phase) {
    case "poserRecurrence":
      return [formatRecurrenceConfirmeeLatex(exercice)];
    case "regimePermanent":
      return [formatRegimeConfirmeLatex(exercice)];
    case "termesSuccessifs":
      return [`${exercice.variableGrandeur}_2=${fractionQVersLatex(exercice.u2)}`, `${exercice.variableGrandeur}_3=${fractionQVersLatex(exercice.u3)}`, `${exercice.variableGrandeur}_4=${fractionQVersLatex(exercice.u4)}`];
  }
}
