import type {
  ExerciceFamilleA_Problemes,
  ExerciceFamilleB_Problemes,
  ExerciceFamilleC_Problemes,
  ExerciceFamilleD_Problemes,
  ExerciceFamilleE_Problemes,
  ExerciceFamilleF_Problemes,
  ExerciceFamilleG_Archimede,
  ExerciceFamilleG_Calotte,
  ExerciceFamilleG_Soustraction,
  ExerciceIntegralesProblemes,
} from "../core6e/integralesProblemes.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquivalenceFonction, diagnostiquerValeur } from "./equivalenceExponentielle";
import { diagnostiquerPrimitive } from "./verificationCalculPrimitives";
import { diagnostiquerFinalIntegrale, diagnostiquerValeurMoyenne } from "./verificationIntegralesDefinies";
import { diagnostiquerAEcran3, diagnostiquerDEcran1 as diagnostiquerVolumeDEcran1 } from "./verificationVolumesRevolution";
import type { PhaseIntegralesProblemes } from "./typesIntegralesProblemes";

/**
 * Couche B (6e) — vérification pour `6gen29`. N'importe JAMAIS rien de `src/generateurs6e/` (règle
 * non négociable, CLAUDE.md) — voir `verificationIntegralesProblemes.test.ts` (fixtures locales
 * factices) et `generateurs6e/integralesProblemes/session.integration.test.ts` pour la preuve.
 *
 * **Réutilisation EXPLICITE de Couche B ↔ Couche B** (libre entre générateurs, CLAUDE.md) :
 * - `diagnostiquerFinalIntegrale`/`diagnostiquerValeurMoyenne` (`moteur6e/verificationIntegralesDefinies.ts`,
 *   6gen25) — famille E, appelées TELLES QUELLES sur `exercice.exerciceMoyenne`.
 * - `diagnostiquerAEcran3` (`moteur6e/verificationVolumesRevolution.ts`, 6gen27 famille A) —
 *   famille G sous-type "soustraction", écran 1 (volume total).
 * - `diagnostiquerDEcran1` (même fichier, 6gen27 famille D) — famille G sous-type "archimede",
 *   écran 1 (volume du paraboloïde).
 * - `diagnostiquerPrimitive` (`moteur6e/verificationCalculPrimitives.ts`, 6gen23) — famille G
 *   sous-type "calotte", écran 2 (primitive de l'intégrande développé).
 *
 * Tous les autres écrans sont des fonctions PROPRES à ce fichier, s'appuyant sur les briques
 * génériques déjà partagées du chapitre (`diagnostiquerValeur`/`diagnostiquerEquivalenceFonction`/
 * `diagnostiquerEnsembleValeurs` de `equivalenceExponentielle.ts`).
 */

const TOLERANCE = 0.01;
const TOLERANCE_LACHE = 0.05; // familles F (résolution numérique) — voir en-tête `familleF.ts`.

function pireStatut(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A — Méthode des trapèzes.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceFamilleA_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.sommeAttendue, TOLERANCE);
}
export function diagnostiquerAEcran2(exercice: ExerciceFamilleA_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.valeurFinaleAttendue, TOLERANCE);
}

// ============================================================================
// Famille B — Cinématique.
// ============================================================================

const CANDIDATS_T = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7];

/** Écran 1 — valeurs[0] = v(t), comparaison STRICTE (constante déjà résolue via v(0), jamais "à une
 * constante près" — piège explicite : oublier v(0) produit un écart constant que cette comparaison
 * ne pardonne jamais). */
export function diagnostiquerBEcran1(exercice: ExerciceFamilleB_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.vReference, CANDIDATS_T, TOLERANCE, "t");
}
/** Écran 2 — valeurs[0] = x(t), même patron (constante résolue via x(0), SÉPARÉMENT de celle de
 * l'écran 1 — 2 constantes distinctes, jamais la même). */
export function diagnostiquerBEcran2(exercice: ExerciceFamilleB_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.xReference, CANDIDATS_T, TOLERANCE, "t");
}
export function diagnostiquerBEcran3(exercice: ExerciceFamilleB_Problemes, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "evaluer") {
    return diagnostiquerValeur(valeurs[0], exercice.xReference(exercice.t1 as number), TOLERANCE);
  }
  return diagnostiquerValeur(valeurs[0], exercice.tSolution as number, TOLERANCE);
}

// ============================================================================
// Famille C — Travail, loi de Hooke.
// ============================================================================

function travailRef(k: number, a: number, b: number): number {
  return (k * (b * b - a * a)) / 2;
}

export function diagnostiquerCEcran1(exercice: ExerciceFamilleC_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.F0 / exercice.x0, TOLERANCE);
}
export function diagnostiquerCEcran2(exercice: ExerciceFamilleC_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], travailRef(exercice.k, exercice.a, exercice.b), TOLERANCE);
}
/** Écran 3 (variante uniquement) — second travail W2=∫[a2;b2]. */
export function diagnostiquerCEcran3(exercice: ExerciceFamilleC_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], travailRef(exercice.k, exercice.a2 as number, exercice.b2 as number), TOLERANCE);
}
/** Écran 4 (variante uniquement) — QCM : les deux travaux sont-ils égaux ? (jamais, F(x)=kx non
 * constante) — comparaison stricte, jamais de `parse_error` (choix, pas de saisie libre). */
export function diagnostiquerCEcran4(_exercice: ExerciceFamilleC_Problemes, valeurs: string[]): StatutVerification {
  return valeurs[0] === "different" ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille D — Coût marginal, total, moyen.
// ============================================================================

const CANDIDATS_Q = [1, 3, 5, 8, 12, 18, 25, 32, 40, 45, 50];

export function diagnostiquerDEcran1(exercice: ExerciceFamilleD_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.CReference, CANDIDATS_Q, TOLERANCE, "q");
}
export function diagnostiquerDEcran2(exercice: ExerciceFamilleD_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.CReference(exercice.q1), TOLERANCE);
}
export function diagnostiquerDEcran3(exercice: ExerciceFamilleD_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.CReference(exercice.q2) - exercice.CReference(exercice.q1), TOLERANCE);
}
export function diagnostiquerDEcran4(exercice: ExerciceFamilleD_Problemes, valeurs: string[]): StatutVerification {
  const points = CANDIDATS_Q.filter((q) => q !== 0);
  return diagnostiquerEquivalenceFonction(valeurs[0], (q: number) => exercice.CReference(q) / q, points, TOLERANCE, "q");
}

// ============================================================================
// Famille E — Valeur moyenne en contexte (RÉUTILISE 6gen25 famille C).
// ============================================================================

export function diagnostiquerEEcran1(exercice: ExerciceFamilleE_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerFinalIntegrale(exercice.exerciceMoyenne, valeurs);
}
export function diagnostiquerEEcran2(exercice: ExerciceFamilleE_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurMoyenne(exercice.exerciceMoyenne, valeurs);
}
export function diagnostiquerEEcran3(exercice: ExerciceFamilleE_Problemes, valeurs: string[]): StatutVerification {
  return valeurs[0] === exercice.interpretationCorrecte ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille F — Surplus consommateur.
// ============================================================================

/** Écran 1 — valeurs=[Q,P], point d'équilibre résolu numériquement (tolérance ÉLARGIE — voir
 * en-tête de fichier et `familleF.ts`). */
export function diagnostiquerFEcran1(exercice: ExerciceFamilleF_Problemes, valeurs: string[]): StatutVerification {
  const sQ = diagnostiquerValeur(valeurs[0], exercice.Q, TOLERANCE_LACHE);
  const sP = diagnostiquerValeur(valeurs[1], exercice.P, TOLERANCE_LACHE);
  return pireStatut(sQ, sP);
}
export function diagnostiquerFEcran2(exercice: ExerciceFamilleF_Problemes, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.surplusAttendu, TOLERANCE_LACHE);
}

// ============================================================================
// Famille G — Volume de révolution appliqué.
// ============================================================================

export function diagnostiquerGSoustractionEcran1(exercice: ExerciceFamilleG_Soustraction, valeurs: string[]): StatutVerification {
  return diagnostiquerAEcran3(exercice.volumeTotal, valeurs);
}
export function diagnostiquerGSoustractionEcran2(exercice: ExerciceFamilleG_Soustraction, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.volumeTotalAttendu - exercice.volumeInterieur, TOLERANCE);
}

export function diagnostiquerGArchimedeEcran1(exercice: ExerciceFamilleG_Archimede, valeurs: string[]): StatutVerification {
  return diagnostiquerVolumeDEcran1(exercice.paraboloide, valeurs);
}
export function diagnostiquerGArchimedeEcran2(exercice: ExerciceFamilleG_Archimede, valeurs: string[]): StatutVerification {
  const volumeDeplace = (4 / 3) * Math.PI * exercice.r * exercice.r * exercice.r;
  return diagnostiquerValeur(valeurs[0], volumeDeplace, TOLERANCE);
}
export function diagnostiquerGArchimedeEcran3(exercice: ExerciceFamilleG_Archimede, valeurs: string[]): StatutVerification {
  const volumeDeplace = (4 / 3) * Math.PI * exercice.r * exercice.r * exercice.r;
  return diagnostiquerValeur(valeurs[0], volumeDeplace / exercice.paraboloide.volumeParaboloide, TOLERANCE);
}

const CANDIDATS_Y = [0.2, 0.5, 0.8, 1.1, 1.4, 1.7, 2, 2.3, 2.6, 2.9];

export function diagnostiquerGCalotteEcran1(exercice: ExerciceFamilleG_Calotte, valeurs: string[]): StatutVerification {
  const points = CANDIDATS_Y.filter((y) => y < 2 * exercice.r);
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.integrandeReference, points, TOLERANCE, "y");
}
export function diagnostiquerGCalotteEcran2(exercice: ExerciceFamilleG_Calotte, valeurs: string[]): StatutVerification {
  const points = CANDIDATS_Y.filter((y) => y < 2 * exercice.r);
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, points, TOLERANCE, "y");
}
export function diagnostiquerGCalotteEcran3(exercice: ExerciceFamilleG_Calotte, valeurs: string[]): StatutVerification {
  const F = exercice.primitiveReference;
  const v = Math.PI * (F(exercice.hDemande) - F(0));
  return diagnostiquerValeur(valeurs[0], v, TOLERANCE);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceFamilleA_Problemes, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceFamilleA_Problemes, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceFamilleB_Problemes, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceFamilleB_Problemes, valeurs);
    case "bEcran3":
      return diagnostiquerBEcran3(exercice as ExerciceFamilleB_Problemes, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceFamilleC_Problemes, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceFamilleC_Problemes, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceFamilleC_Problemes, valeurs);
    case "cEcran4":
      return diagnostiquerCEcran4(exercice as ExerciceFamilleC_Problemes, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceFamilleD_Problemes, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceFamilleD_Problemes, valeurs);
    case "dEcran3":
      return diagnostiquerDEcran3(exercice as ExerciceFamilleD_Problemes, valeurs);
    case "dEcran4":
      return diagnostiquerDEcran4(exercice as ExerciceFamilleD_Problemes, valeurs);
    case "eEcran1":
      return diagnostiquerEEcran1(exercice as ExerciceFamilleE_Problemes, valeurs);
    case "eEcran2":
      return diagnostiquerEEcran2(exercice as ExerciceFamilleE_Problemes, valeurs);
    case "eEcran3":
      return diagnostiquerEEcran3(exercice as ExerciceFamilleE_Problemes, valeurs);
    case "fEcran1":
      return diagnostiquerFEcran1(exercice as ExerciceFamilleF_Problemes, valeurs);
    case "fEcran2":
      return diagnostiquerFEcran2(exercice as ExerciceFamilleF_Problemes, valeurs);
    case "gSoustractionEcran1":
      return diagnostiquerGSoustractionEcran1(exercice as ExerciceFamilleG_Soustraction, valeurs);
    case "gSoustractionEcran2":
      return diagnostiquerGSoustractionEcran2(exercice as ExerciceFamilleG_Soustraction, valeurs);
    case "gArchimedeEcran1":
      return diagnostiquerGArchimedeEcran1(exercice as ExerciceFamilleG_Archimede, valeurs);
    case "gArchimedeEcran2":
      return diagnostiquerGArchimedeEcran2(exercice as ExerciceFamilleG_Archimede, valeurs);
    case "gArchimedeEcran3":
      return diagnostiquerGArchimedeEcran3(exercice as ExerciceFamilleG_Archimede, valeurs);
    case "gCalotteEcran1":
      return diagnostiquerGCalotteEcran1(exercice as ExerciceFamilleG_Calotte, valeurs);
    case "gCalotteEcran2":
      return diagnostiquerGCalotteEcran2(exercice as ExerciceFamilleG_Calotte, valeurs);
    case "gCalotteEcran3":
      return diagnostiquerGCalotteEcran3(exercice as ExerciceFamilleG_Calotte, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}

// Réexport pour usage direct (mirroir 6gen23/26/27) — ex. QCM familles C/E, réponses attendues UI.
export { diagnostiquerEnsembleValeurs, diagnostiquerEquivalenceFonction, diagnostiquerValeur };
