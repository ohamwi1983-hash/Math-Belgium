import type { ExerciceDenombCombA, ExerciceDenombCombB, ExerciceDenombCombC, ExerciceDenombCombD, ExerciceDenombrementCombine } from "../core6e/denombrementCombine.types";
import { diagnostiquerValeurCombinatoire, diagnostiquerValeursCombinatoire } from "./expressionCombinatoire";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseDenombrementCombine } from "./typesDenombrementCombine";

/**
 * Couche B (6e) — vérification propre à `6gen44` (dispatch par famille/sous-type/écran). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/denombrementCombine/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble.
 *
 * Toutes les valeurs attendues sont déjà PRÉ-CALCULÉES par la Couche A dans l'exercice. Ce fichier se
 * contente de les comparer, dans l'ORDRE d'affichage, à la saisie élève — via l'évaluateur EXACT
 * `expressionCombinatoire.ts` (BigInt, ÉGALITÉ EXACTE, pas de tolérance flottante — voir son en-tête)
 * pour TOUT champ numérique/formule, familles A à D indifféremment. Les 3 écrans de CHOIX (jamais de
 * texte libre) — famille B écran 1 (structure), famille C écran 1 sous-type "comparaison"
 * (attribution discernable/indiscernable), famille D écran 1 (type de contrainte) — comparent
 * directement l'identifiant choisi (`correct`/`not_equivalent` uniquement, jamais `parse_error`).
 */

// ============================================================================
// Famille A — 1 seul écran de formule (texte), 1 écran de calcul (texte) — même cible (`resultat`,
// BigInt) aux 2 écrans.
// ============================================================================

export function diagnostiquerAEcran(exercice: ExerciceDenombCombA, _phase: PhaseDenombrementCombine, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurCombinatoire(valeurs[0] ?? "", exercice.resultat);
}

// ============================================================================
// Famille B — écran 1 : CHOIX (jamais de saisie libre) parmi les 4 structures. Écran 2 : calcul.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceDenombCombB, valeurs: string[]): StatutVerification {
  return valeurs[0] === exercice.sousType ? "correct" : "not_equivalent";
}
export function diagnostiquerBEcran2(exercice: ExerciceDenombCombB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurCombinatoire(valeurs[0] ?? "", exercice.resultat);
}
export function diagnostiquerBEcran(exercice: ExerciceDenombCombB, phase: PhaseDenombrementCombine, valeurs: string[]): StatutVerification {
  return phase === "bEcran1" ? diagnostiquerBEcran1(exercice, valeurs) : diagnostiquerBEcran2(exercice, valeurs);
}

// ============================================================================
// Famille C — sous-type "repetition" : écran 1 formule texte, écran 2 calcul texte (1 champ chacun).
// sous-type "comparaison" : écran 1 ATTRIBUTION (2 champs `choix` — discernable puis indiscernable),
// écran 2 calcul des 2 valeurs (2 champs texte).
// ============================================================================

export function diagnostiquerCEcran(exercice: ExerciceDenombCombC, phase: PhaseDenombrementCombine, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "repetition") {
    return diagnostiquerValeurCombinatoire(valeurs[0] ?? "", exercice.resultat);
  }
  // sousType === "comparaison"
  if (phase === "cEcran1") {
    const attendu = ["carre", "combinaisonRep"]; // [discernable, indiscernable]
    const statuts: StatutVerification[] = attendu.map((v, i) => (valeurs[i] === v ? "correct" : "not_equivalent"));
    return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
  }
  return diagnostiquerValeursCombinatoire(valeurs, [exercice.resultatDiscernable, exercice.resultatIndiscernable]);
}

// ============================================================================
// Famille D — écran 1 : CHOIX (jamais de saisie libre) entre "exclusion" et "indissociable".
// Écran 2 : calcul des 2 termes séparément. Écran 3 : combinaison finale (1 champ).
// ============================================================================

export function diagnostiquerDEcran1(exercice: ExerciceDenombCombD, valeurs: string[]): StatutVerification {
  return valeurs[0] === exercice.typeContrainte ? "correct" : "not_equivalent";
}
export function diagnostiquerDEcran2(exercice: ExerciceDenombCombD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeursCombinatoire(valeurs, [exercice.terme1, exercice.terme2]);
}
export function diagnostiquerDEcran3(exercice: ExerciceDenombCombD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurCombinatoire(valeurs[0] ?? "", exercice.resultatFinal);
}
export function diagnostiquerDEcran(exercice: ExerciceDenombCombD, phase: PhaseDenombrementCombine, valeurs: string[]): StatutVerification {
  if (phase === "dEcran1") return diagnostiquerDEcran1(exercice, valeurs);
  if (phase === "dEcran2") return diagnostiquerDEcran2(exercice, valeurs);
  return diagnostiquerDEcran3(exercice, valeurs);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceDenombrementCombine, phase: PhaseDenombrementCombine, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerAEcran(exercice, phase, valeurs);
    case "B":
      return diagnostiquerBEcran(exercice, phase, valeurs);
    case "C":
      return diagnostiquerCEcran(exercice, phase, valeurs);
    case "D":
      return diagnostiquerDEcran(exercice, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceDenombrementCombine, phase: PhaseDenombrementCombine, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
