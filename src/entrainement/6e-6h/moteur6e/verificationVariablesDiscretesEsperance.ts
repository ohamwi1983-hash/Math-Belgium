import type { ExerciceEsperanceA, ExerciceEsperanceB, ExerciceEsperanceC, ExerciceVariablesDiscretesEsperance } from "../core6e/variablesDiscretesEsperance.types";
import { diagnostiquerEquivalenceFonction, diagnostiquerValeur } from "./equivalenceExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseVariablesDiscretesEsperance } from "./typesVariablesDiscretesEsperance";

/**
 * Couche B (6e) — vérification propre à `6gen49` (dispatch par famille/sous-type/écran). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/variablesDiscretesEsperance/session.integration.test.ts` pour le seul fichier
 * autorisé Couche A + Couche B ensemble.
 *
 * Réutilise `diagnostiquerValeur` (`moteur6e/equivalenceExponentielle.ts`) pour tout champ
 * numérique pur — MÊME convention de tolérance (0,01, défaut de la fonction) que
 * `moteur6e/verificationProbabilites.ts` (6gen30, chapitre 8) et que `6gen47`
 * (`verificationProbabiliteHypergeometrique.ts`) : les dénominateurs de ce générateur restent
 * modestes (poids sur 20 pour les tables construites par la Couche A, populations hypergéométriques
 * ≤16) donc l'écart minimal entre 2 probabilités DISTINCTES reste ≥0,05, largement au-dessus de la
 * tolérance — importé DIRECTEMENT depuis `equivalenceExponentielle.ts` plutôt que réexporté via
 * `verificationProbabilites.ts` (propre au chapitre "Probabilités"/6gen30-33), suivant le PRÉCÉDENT
 * du générateur sœur `6gen51` (même nouveau chapitre "Variables aléatoires et lois de
 * probabilités", voir en-tête `verificationLoiNormale.ts`) : chaque chapitre importe directement sa
 * fondation commune (`equivalenceExponentielle.ts`), jamais via le wrapper d'un AUTRE chapitre.
 *
 * `diagnostiquerEquivalenceFonction` (même fichier) réutilisée pour la famille C sous-type
 * "imposer" (gain net et espérance EN FONCTION DE `m`, un paramètre inconnu) — échantillonnage
 * numérique à plusieurs valeurs de `m`, EXACTEMENT le même mécanisme déjà utilisé ailleurs sur ce
 * chantier pour une expression paramétrique (ex. `verificationProbabilitesProblemes.ts`,
 * `eParamEcran1`/`2`) plutôt qu'une bibliothèque d'algèbre symbolique (aucune installée sur ce
 * projet).
 */

const POINTS_M = [-8, -3, -1, 0, 1, 2, 5, 9];

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

export function diagnostiquerAEcran(exercice: ExerciceEsperanceA, phase: PhaseVariablesDiscretesEsperance, valeurs: string[]): StatutVerification {
  if (phase === "aEcran1") return diagnostiquerValeurs(valeurs, [exercice.probabilite1]);
  if (phase === "aEcran2") return diagnostiquerValeurs(valeurs, [exercice.probabilite2]);
  // aEcran3 — choix (jamais de saisie libre, jamais "parse_error").
  const attendu = exercice.contraires ? "contraires" : "non_contraires";
  return valeurs[0] === attendu ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille B — écran 1 : table complète (valeur, probabilité) par ligne, DANS L'ORDRE de `loi`.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceEsperanceB, valeurs: string[]): StatutVerification {
  const attendues: number[] = [];
  exercice.loi.forEach((ligne) => attendues.push(ligne.valeur, ligne.probabilite));
  return diagnostiquerValeurs(valeurs, attendues);
}
export function diagnostiquerBEcran2(exercice: ExerciceEsperanceB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [exercice.esperance]);
}
export function diagnostiquerBEcran(exercice: ExerciceEsperanceB, phase: PhaseVariablesDiscretesEsperance, valeurs: string[]): StatutVerification {
  return phase === "bEcran1" ? diagnostiquerBEcran1(exercice, valeurs) : diagnostiquerBEcran2(exercice, valeurs);
}

// ============================================================================
// Famille C.
// ============================================================================

/** Écran 1, sous-type "vérifier" — table (gain net = gain brut, probabilité) par issue. */
export function diagnostiquerCVerifierEcran1(exercice: ExerciceEsperanceC, valeurs: string[]): StatutVerification {
  const attendues: number[] = [];
  exercice.issues.forEach((issue) => attendues.push(issue.gainBrut, issue.probabilite));
  return diagnostiquerValeurs(valeurs, attendues);
}
export function diagnostiquerCVerifierEcran2(exercice: ExerciceEsperanceC, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [exercice.esperanceBrute]);
}

/** Écran 1, sous-type "imposer" — table (gain net EN FONCTION DE m, probabilité) par issue : le
 * champ "gain net" est une EXPRESSION en `m` (ex. "8-m"), vérifiée par échantillonnage. */
export function diagnostiquerCImposerEcran1(exercice: ExerciceEsperanceC, valeurs: string[]): StatutVerification {
  const statuts: StatutVerification[] = [];
  exercice.issues.forEach((issue, i) => {
    const texteGainNet = valeurs[2 * i] ?? "";
    const texteProbabilite = valeurs[2 * i + 1] ?? "";
    statuts.push(diagnostiquerEquivalenceFonction(texteGainNet, (m) => issue.gainBrut - m, POINTS_M, 0.01, "m"));
    statuts.push(diagnostiquerValeur(texteProbabilite, issue.probabilite));
  });
  return combinerStatuts(...statuts);
}
export function diagnostiquerCImposerEcran2(exercice: ExerciceEsperanceC, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0] ?? "", (m) => exercice.esperanceBrute - m, POINTS_M, 0.01, "m");
}
export function diagnostiquerCImposerEcran3(exercice: ExerciceEsperanceC, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [exercice.mSolution]);
}

export function diagnostiquerCEcran(exercice: ExerciceEsperanceC, phase: PhaseVariablesDiscretesEsperance, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "cVerifierEcran1":
      return diagnostiquerCVerifierEcran1(exercice, valeurs);
    case "cVerifierEcran2":
      return diagnostiquerCVerifierEcran2(exercice, valeurs);
    case "cImposerEcran1":
      return diagnostiquerCImposerEcran1(exercice, valeurs);
    case "cImposerEcran2":
      return diagnostiquerCImposerEcran2(exercice, valeurs);
    default:
      return diagnostiquerCImposerEcran3(exercice, valeurs);
  }
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceVariablesDiscretesEsperance, phase: PhaseVariablesDiscretesEsperance, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerAEcran(exercice, phase, valeurs);
    case "B":
      return diagnostiquerBEcran(exercice, phase, valeurs);
    case "C":
      return diagnostiquerCEcran(exercice, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceVariablesDiscretesEsperance, phase: PhaseVariablesDiscretesEsperance, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
