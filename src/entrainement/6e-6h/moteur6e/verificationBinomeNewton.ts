import type { ExerciceBinomeA, ExerciceBinomeB, ExerciceBinomeC, ExerciceBinomeNewton } from "../core6e/binomeNewton.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseBinomeNewton } from "./typesBinomeNewton";
import { diagnostiquerEquivalenceFonction, diagnostiquerValeur } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — vérification propre à `6gen45` (dispatch par famille/écran). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/binomeNewton/session.integration.test.ts` pour le seul fichier autorisé Couche A +
 * Couche B ensemble.
 *
 * Toutes les valeurs attendues sont déjà PRÉ-CALCULÉES par la Couche A dans l'exercice (voir
 * en-tête `core6e/binomeNewton.types.ts`) — ce fichier se contente de les comparer à la saisie
 * élève. **Réutilise `moteur6e/equivalenceExponentielle.ts`** (chapitre 2, `diagnostiquerValeur` /
 * `diagnostiquerEquivalenceFonction` — réutilisation intra-chantier moteur→moteur, explicitement
 * autorisée par l'architecture, déjà pratiquée par `verificationDenombrementFondamental.ts`,
 * 6gen43) plutôt que `moteur6e/expressionCombinatoire.ts` (6gen44, BigInt/`C(n,k)` littéral) : ce
 * générateur a besoin de décimaux (famille C, ε) et d'une variable `x` (familles A/B, polynômes) —
 * aucun des deux n'est supporté par l'évaluateur BigInt de 6gen44, qui ne connaît que les entiers et
 * n'a pas de notion de variable. Voir `docs/historique-6e.md` pour la discussion complète des
 * options considérées.
 *
 * Échantillonnage à 8 points pour `diagnostiquerEquivalenceFonction` (famille A écran 3, seul champ
 * réellement polynomial en x de ce générateur) — largement suffisant pour distinguer deux
 * polynômes de degré ≤6 (n≤6) : deux polynômes de degré ≤6 qui coïncident en 7 points distincts
 * sont IDENTIQUES (leur différence, de degré ≤6, aurait 7 racines).
 */

const POINTS_ECHANTILLON = [-3, -2, -1.5, -1, 0.5, 1, 1.5, 2, 3];

/** Tolérance étroite pour les champs décimaux de la famille C (ε petit, certains termes valent
 * `10^-8` à `10^-10` — la tolérance par défaut `0.01` de `equivalenceExponentielle.ts` les
 * confondrait tous avec 0). */
const TOLERANCE_DECIMALE_C = 1e-9;

/** Comparaison POSITION PAR POSITION (jamais ordre indifférent, contrairement à
 * `diagnostiquerEnsembleValeurs` — chaque champ correspond à un terme `k` précis) — mirroir
 * `diagnostiquerValeurs` de `verificationDenombrementFondamental.ts` (6gen43). */
function diagnostiquerValeursPositionnelles(valeurs: string[], attendues: number[], tolerance?: number): StatutVerification {
  if (valeurs.length !== attendues.length) return "not_equivalent";
  const statuts = attendues.map((v, i) => diagnostiquerValeur(valeurs[i] ?? "", v, tolerance));
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

// ============================================================================
// Famille A.
// ============================================================================

function referencePolynomeA(e: ExerciceBinomeA): (x: number) => number {
  return (x: number) => e.termes.reduce((acc, t) => acc + t.coefficientFinal * Math.pow(x, t.exposantX), 0);
}

export function diagnostiquerAEcran(e: ExerciceBinomeA, phase: PhaseBinomeNewton, valeurs: string[]): StatutVerification {
  if (phase === "aEcran1") return diagnostiquerValeursPositionnelles(valeurs, e.termes.map((t) => t.coefficientBinomial));
  if (phase === "aEcran2") return diagnostiquerValeursPositionnelles(valeurs, e.termes.map((t) => t.coefficientFinal));
  return diagnostiquerEquivalenceFonction(valeurs[0] ?? "", referencePolynomeA(e), POINTS_ECHANTILLON);
}

// ============================================================================
// Famille B.
// ============================================================================

export function diagnostiquerBEcran(e: ExerciceBinomeB, phase: PhaseBinomeNewton, valeurs: string[]): StatutVerification {
  if (phase === "bTrouverKEcran") return diagnostiquerValeur(valeurs[0] ?? "", e.k);
  if (phase === "bPoserEcran") return diagnostiquerValeursPositionnelles(valeurs, [e.coefficientBinomial, e.bPuissanceK]);
  return diagnostiquerValeur(valeurs[0] ?? "", e.coefficientFinal);
}

// ============================================================================
// Famille C.
// ============================================================================

export function diagnostiquerCEcran(e: ExerciceBinomeC, phase: PhaseBinomeNewton, valeurs: string[]): StatutVerification {
  if (phase === "cEcran1") return diagnostiquerValeursPositionnelles(valeurs, e.termes.map((t) => t.coefficientBinomial));
  if (phase === "cEcran2") return diagnostiquerValeursPositionnelles(valeurs, e.termes.map((t) => t.valeurTerme), TOLERANCE_DECIMALE_C);
  return diagnostiquerValeur(valeurs[0] ?? "", e.valeurFinale, TOLERANCE_DECIMALE_C);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceBinomeNewton, phase: PhaseBinomeNewton, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerAEcran(exercice, phase, valeurs);
    case "B":
      return diagnostiquerBEcran(exercice, phase, valeurs);
    case "C":
      return diagnostiquerCEcran(exercice, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceBinomeNewton, phase: PhaseBinomeNewton, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
