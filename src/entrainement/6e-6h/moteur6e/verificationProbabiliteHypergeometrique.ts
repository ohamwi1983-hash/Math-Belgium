import type { ExerciceProbabiliteHypergeometrique } from "../core6e/probabiliteHypergeometrique.types";
import { diagnostiquerValeur } from "./verificationProbabilites";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseProbabiliteHypergeometrique } from "./typesProbabiliteHypergeometrique";

/**
 * Couche B (6e) — vérification propre à `6gen47` (dispatch par famille/phase). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/probabiliteHypergeometrique/session.integration.test.ts` pour le seul fichier
 * autorisé Couche A + Couche B ensemble.
 *
 * Toutes les valeurs attendues sont déjà PRÉ-CALCULÉES par la Couche A dans l'exercice — ce fichier
 * se contente de les comparer à la saisie élève via `diagnostiquerValeur`
 * (`moteur6e/verificationProbabilites.ts`, chapitre 8/6gen30) — **convention de tolérance
 * RÉUTILISÉE SANS MODIFICATION** (0,01, "forme exacte ou décimale arrondie au centième") : c'est
 * exactement la brique documentée comme "à réutiliser tel quel par tout générateur du chapitre 8
 * en aval" pour tout champ de probabilité en texte libre, et ce générateur — bien que rattaché au
 * chapitre "Analyse combinatoire" plutôt qu'au chapitre 8 — calcule des PROBABILITÉS au sens
 * strict (valeurs numériques dans [0,1]), le cas d'usage exact pour lequel cette fonction a été
 * conçue. La seule adaptation nécessaire est côté GÉNÉRATION (`generateurs6e/
 * probabiliteHypergeometrique/familleA.ts`, rejet des tirages à probabilité trop proche de 0/1) —
 * documentée là-bas, jamais ici : ce fichier n'a besoin d'aucun wrapper spécifique.
 *
 * Écran 1 de la famille A ("pose la formule, non calculée") ACCEPTE une expression NON réduite
 * (ex. "6*35/120") — `diagnostiquerValeur` évalue l'expression via `evaluerValeurExponentielle`
 * (support natif de `*`/`/`), donc une fraction non réduite s'évalue exactement comme la valeur
 * cible — mirroir `6gen33` famille B écran 1 ("pose la formule complète... indique une expression,
 * sans forcément la réduire à l'avance").
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
// Famille A — Hypergéométrique de base (2 écrans, MÊME valeur cible sur les 2 — mirroir 6gen33
// famille B écran1/écran2).
// ============================================================================

export function diagnostiquerAEcran(exercice: ExerciceProbabiliteHypergeometrique, valeurs: string[]): StatutVerification {
  if (exercice.famille !== "A") throw new Error("diagnostiquerAEcran : exercice attendu de famille A");
  return diagnostiquerValeurs(valeurs, [exercice.probabilite]);
}

// ============================================================================
// Famille B — Contraste ordre vs composition (3 écrans).
// ============================================================================

export function diagnostiquerBEcran(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique, valeurs: string[]): StatutVerification {
  if (exercice.famille !== "B") throw new Error("diagnostiquerBEcran : exercice attendu de famille B");
  if (phase === "bEcran1") return diagnostiquerValeurs(valeurs, [exercice.probabiliteSequence]);
  if (phase === "bEcran2") return diagnostiquerValeurs(valeurs, [exercice.probabiliteComposition]);
  // bEcran3 : rapport (probabiliteComposition/probabiliteSequence) ET nombre d'arrangements —
  // les 2 champs valent, mathématiquement, la MÊME valeur (identité vérifiée Couche A, voir
  // `generateurs6e/probabiliteHypergeometrique/familleB.ts`).
  return diagnostiquerValeurs(valeurs, [exercice.nombreArrangements, exercice.nombreArrangements]);
}

// ============================================================================
// Famille C — Hypergéométrique à 2 catégories croisées (3 écrans).
// ============================================================================

export function diagnostiquerCEcran(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique, valeurs: string[]): StatutVerification {
  if (exercice.famille !== "C") throw new Error("diagnostiquerCEcran : exercice attendu de famille C");
  if (phase === "cEcran1") return diagnostiquerValeurs(valeurs, [exercice.principal.probabilite]);
  if (phase === "cEcran2") return diagnostiquerValeurs(valeurs, [exercice.bonus.probabilite]);
  return diagnostiquerValeurs(valeurs, [exercice.probabiliteCombinee]);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerAEcran(exercice, valeurs);
    case "B":
      return diagnostiquerBEcran(exercice, phase, valeurs);
    case "C":
      return diagnostiquerCEcran(exercice, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceProbabiliteHypergeometrique, phase: PhaseProbabiliteHypergeometrique, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
