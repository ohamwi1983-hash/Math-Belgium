import type {
  ExerciceDenombA_BorneSuperieure,
  ExerciceDenombA_ContientDeuxChiffres,
  ExerciceDenombA_ContientUnChiffre,
  ExerciceDenombA_Parite,
  ExerciceDenombA_PositionFixee,
  ExerciceDenombA_Total,
  ExerciceDenombB_Direct,
  ExerciceDenombB_Inverse,
  ExerciceDenombrementC,
  ExerciceDenombrementD,
  ExerciceDenombrementE,
  ExerciceDenombrementFondamental,
} from "../core6e/denombrementFondamental.types";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseDenombrementFondamental } from "./typesDenombrementFondamental";

/**
 * Couche B (6e) — vérification propre à `6gen43` (dispatch par famille/sous-type/écran). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/denombrementFondamental/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble.
 *
 * Toutes les valeurs attendues sont déjà PRÉ-CALCULÉES par la Couche A dans l'exercice (voir
 * en-tête `core6e/denombrementFondamental.types.ts`) — ce fichier se contente de les comparer, dans
 * l'ORDRE d'affichage, à la saisie élève. Réutilise `diagnostiquerValeur`
 * (`moteur6e/equivalenceExponentielle.ts`, chapitre 2) pour tout champ numérique — "toutes les
 * valeurs numériques : égalité exacte" (mission) est satisfait par sa tolérance fixe (0.01),
 * largement en-deçà de 1 (écart minimal entre 2 entiers distincts), donc équivalent à une égalité
 * stricte pour ce générateur tout en acceptant une expression saisie (ex. "9*8*7") plutôt qu'une
 * valeur déjà réduite — cohérent avec la saisie élève "toujours libre décimal/fraction" (CLAUDE.md).
 * Les 2 SEULS écrans de CHOIX (jamais de texte libre) — famille C écran 1 (formule), famille E
 * écran 1 (table/collier) — comparent directement l'identifiant choisi (`correct`/`not_equivalent`
 * uniquement, jamais `parse_error`, pas de saisie libre possible).
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerValeurs(valeurs: string[], attendues: number[]): StatutVerification {
  return combinerStatuts(...attendues.map((v, i) => diagnostiquerValeur(valeurs[i] ?? "", v)));
}

// ============================================================================
// Famille A.
// ============================================================================

function champsAEcran1PositionFixee(e: ExerciceDenombA_PositionFixee): number[] {
  return e.choixPosition1 === null ? [...e.choixPositionsFixees] : [...e.choixPositionsFixees, e.choixPosition1];
}

export function diagnostiquerAEcran(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental, valeurs: string[]): StatutVerification {
  if (exercice.famille !== "A") throw new Error("diagnostiquerAEcran : exercice attendu de famille A");
  switch (exercice.sousType) {
    case "total": {
      const e: ExerciceDenombA_Total = exercice;
      if (phase === "aTotalEcran1") return diagnostiquerValeurs(valeurs, [e.choixPosition1]);
      return diagnostiquerValeurs(valeurs, [...e.choixPositionsRestantes, e.total]);
    }
    case "positionFixee": {
      const e: ExerciceDenombA_PositionFixee = exercice;
      if (phase === "aPositionFixeeEcran1") return diagnostiquerValeurs(valeurs, champsAEcran1PositionFixee(e));
      return diagnostiquerValeurs(valeurs, [...e.choixPositionsRestantes, e.total]);
    }
    case "contientUnChiffre": {
      const e: ExerciceDenombA_ContientUnChiffre = exercice;
      if (phase === "aContientUnEcran1") return diagnostiquerValeurs(valeurs, [e.choixPosition1SansD]);
      if (phase === "aContientUnEcran2") return diagnostiquerValeurs(valeurs, [...e.choixPositionsRestantesSansD, e.sansD]);
      return diagnostiquerValeurs(valeurs, [e.resultatFinal]);
    }
    case "contientDeuxChiffres": {
      const e: ExerciceDenombA_ContientDeuxChiffres = exercice;
      if (phase === "aContientDeuxEcran1") return diagnostiquerValeurs(valeurs, [e.choixPosition1SansLesDeux]);
      if (phase === "aContientDeuxEcran2") return diagnostiquerValeurs(valeurs, [...e.choixPositionsRestantesSansLesDeux, e.sansLesDeux]);
      return diagnostiquerValeurs(valeurs, [e.resultatFinal]);
    }
    case "borneSuperieure": {
      const e: ExerciceDenombA_BorneSuperieure = exercice;
      if (phase === "aBorneEcran1") return diagnostiquerValeurs(valeurs, [e.choixPosition1]);
      return diagnostiquerValeurs(valeurs, [...e.choixPositionsRestantes, e.total]);
    }
    case "parite": {
      const e: ExerciceDenombA_Parite = exercice;
      if (phase === "aPariteEcran1") return diagnostiquerValeurs(valeurs, [e.choixPremierSiDernierZero, e.choixPremierSiDernierNonZero]);
      if (phase === "aPariteEcran2") return diagnostiquerValeurs(valeurs, e.choixPositionsMilieu);
      return diagnostiquerValeurs(valeurs, [e.resultatFinal]);
    }
  }
}

// ============================================================================
// Famille B.
// ============================================================================

export function diagnostiquerBEcran(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental, valeurs: string[]): StatutVerification {
  if (exercice.famille !== "B") throw new Error("diagnostiquerBEcran : exercice attendu de famille B");
  if (exercice.sousType === "direct") {
    const e: ExerciceDenombB_Direct = exercice;
    return diagnostiquerValeurs(valeurs, [e.diagonales]);
  }
  const e: ExerciceDenombB_Inverse = exercice;
  if (phase === "bInverseEcran1") return diagnostiquerValeurs(valeurs, [e.constanteEquation]);
  return diagnostiquerValeurs(valeurs, [e.n]);
}

// ============================================================================
// Famille C — écran 1 : CHOIX (jamais de saisie libre) parmi `FormuleC`.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceDenombrementC, valeurs: string[]): StatutVerification {
  return valeurs[0] === exercice.formule ? "correct" : "not_equivalent";
}
export function diagnostiquerCEcran2(exercice: ExerciceDenombrementC, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [exercice.resultat]);
}
export function diagnostiquerCEcran(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental, valeurs: string[]): StatutVerification {
  if (exercice.famille !== "C") throw new Error("diagnostiquerCEcran : exercice attendu de famille C");
  return phase === "cEcran1" ? diagnostiquerCEcran1(exercice, valeurs) : diagnostiquerCEcran2(exercice, valeurs);
}

// ============================================================================
// Famille D.
// ============================================================================

export function diagnostiquerDEcran(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental, valeurs: string[]): StatutVerification {
  if (exercice.famille !== "D") throw new Error("diagnostiquerDEcran : exercice attendu de famille D");
  const e: ExerciceDenombrementD = exercice;
  if (phase === "dEcran1") return diagnostiquerValeurs(valeurs, [e.nombreUnites]);
  if (phase === "dEcran2") return diagnostiquerValeurs(valeurs, [e.arrangementsBlocs]);
  return diagnostiquerValeurs(valeurs, [e.resultatFinal]);
}

// ============================================================================
// Famille E — écran 1 : CHOIX (jamais de saisie libre) entre "table" et "collier".
// ============================================================================

export function diagnostiquerEEcran1(exercice: ExerciceDenombrementE, valeurs: string[]): StatutVerification {
  return valeurs[0] === exercice.sousType ? "correct" : "not_equivalent";
}
export function diagnostiquerEEcran2(exercice: ExerciceDenombrementE, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [exercice.resultat]);
}
export function diagnostiquerEEcran(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental, valeurs: string[]): StatutVerification {
  if (exercice.famille !== "E") throw new Error("diagnostiquerEEcran : exercice attendu de famille E");
  return phase === "eEcran1" ? diagnostiquerEEcran1(exercice, valeurs) : diagnostiquerEEcran2(exercice, valeurs);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerAEcran(exercice, phase, valeurs);
    case "B":
      return diagnostiquerBEcran(exercice, phase, valeurs);
    case "C":
      return diagnostiquerCEcran(exercice, phase, valeurs);
    case "D":
      return diagnostiquerDEcran(exercice, phase, valeurs);
    case "E":
      return diagnostiquerEEcran(exercice, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceDenombrementFondamental, phase: PhaseDenombrementFondamental, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
