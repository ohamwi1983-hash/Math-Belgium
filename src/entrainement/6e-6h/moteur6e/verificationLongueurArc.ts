import type { ExerciceLongueurArc, ExerciceLongueurArcA, ExerciceLongueurArcB, ExerciceLongueurArcC } from "../core6e/longueurArc.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquivalenceFonction, diagnostiquerValeur } from "./equivalenceExponentielle";
import type { PhaseLongueurArc } from "./typesLongueurArc";
import { diagnostiquerPrimitive } from "./verificationCalculPrimitives";

/**
 * Couche B (6e) — vérification pour `6gen28` ("Longueur d'un arc de courbe", chapitre 4). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `verificationLongueurArc.test.ts` (fixtures locales factices) et
 * `generateurs6e/longueurArc/session.integration.test.ts` (seul fichier autorisé Couche A + Couche
 * B) pour la preuve.
 *
 * **RÉUTILISATION (Couche B ↔ Couche B, libre — CLAUDE.md)** : `diagnostiquerValeur`/
 * `diagnostiquerEquivalenceFonction`/`diagnostiquerEnsembleValeurs`
 * (`moteur6e/equivalenceExponentielle.ts`) — briques partagées par tout le chantier 6e. Surtout
 * `diagnostiquerPrimitive` (`moteur6e/verificationCalculPrimitives.ts`) — LA brique "primitive à
 * une constante additive près" déjà écrite pour 6gen23, réutilisée TELLE QUELLE (jamais réécrite)
 * pour l'écran "primitive en t" de la famille B (écran 3) et l'écran "primitive" de la famille C
 * (écran 2) : ces 2 écrans ont exactement le même besoin ("comparer à une référence connue, à une
 * constante additive près") que tout écran "trouver une primitive" de 6gen23.
 *
 * ============================================================================
 * **ÉCRAN SPÉCIAL — famille A, écran 2 : la réponse DOIT être structurellement simplifiée**
 * ============================================================================
 * Sur CET écran (et lui seul, sur toute la plateforme à ce jour), une expression numériquement
 * équivalente à la réponse attendue ne suffit PAS : l'exercice teste précisément la RECONNAISSANCE
 * qu'un carré parfait se cache sous la racine, donc une réponse qui reste sous forme
 * "√(1+f'(x)²)" (ex. `sqrt(1+(0.5*(x^n-x^(-n)))^2)`) — mathématiquement identique à la bonne
 * réponse, mais qui n'a PAS fait le travail de simplification demandé — doit être REJETÉE. La
 * vérification numérique seule (`diagnostiquerEquivalenceFonction`, utilisée PARTOUT ailleurs sur
 * cette plateforme) ne peut PAS distinguer les deux cas : les deux expressions valent exactement
 * la même chose en tout point. Il faut donc un contrôle STRUCTUREL supplémentaire.
 *
 * **Solution retenue** : `diagnostiquerAEcran2` applique DEUX contrôles successifs — (1)
 * l'équivalence numérique standard (rejette toute réponse mathématiquement fausse, avec
 * `parse_error` prioritaire comme partout ailleurs) PUIS (2), seulement si (1) est "correct", un
 * contrôle syntaxique : le texte soumis (espaces retirés, casse ignorée) ne doit contenir AUCUNE
 * occurrence littérale de `"sqrt("` — la présence de ce motif prouve que l'élève n'a pas simplifié
 * la racine, quelle que soit la valeur numérique du résultat. Une réponse qui échoue ce second
 * contrôle est classée `"not_equivalent"` (jamais `"parse_error"` — l'expression a bel et bien pu
 * être LUE et évaluée, elle est seulement structurellement refusée, même convention que le rejet
 * d'une forme développée par un vérificateur qui exige une forme factorisée, voir
 * `moteur/statutVerification.ts`). Analogue exact du contraste demandé par la spec entre familles A
 * (doit simplifier) et C (n'importe quelle forme équivalente acceptée, tolérance
 * symbolique/numérique explicitement plus laxiste) — voir `diagnostiquerCEcran3` plus bas.
 *
 * **Preuve TDD** : `verificationLongueurArc.test.ts`, "écran 2 — LE PIÈGE CENTRAL" — soumet
 * `sqrt(1+(0.5*(x^n-x^(-n)))^2)` (équivalent mais non simplifié) et vérifie le rejet, PUIS soumet
 * `0.5*(x^n+x^(-n))` (forme simplifiée) et vérifie l'acceptation.
 */

const TOLERANCE = 0.01;

/** Vrai si `texte` contient une occurrence littérale de "sqrt(" (espaces ignorés, insensible à la
 * casse) — voir en-tête de fichier, "Écran spécial". */
function contientRacineLitterale(texte: string): boolean {
  return texte.toLowerCase().replace(/\s+/g, "").includes("sqrt(");
}

// ============================================================================
// Famille A — Racine parfaite par construction.
// ============================================================================

const CANDIDATS_X_POSITIF_A = [0.6, 1, 1.4, 1.8, 2.3, 2.9, 3.4, 4.1, 4.7];

export function diagnostiquerAEcran1(exercice: ExerciceLongueurArcA, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.fPrimeReference, CANDIDATS_X_POSITIF_A, TOLERANCE);
}
export function verifierAEcran1(exercice: ExerciceLongueurArcA, valeurs: string[]): boolean {
  return diagnostiquerAEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — voir en-tête de fichier ("ÉCRAN SPÉCIAL"). */
export function diagnostiquerAEcran2(exercice: ExerciceLongueurArcA, valeurs: string[]): StatutVerification {
  const texte = valeurs[0];
  const equivalence = diagnostiquerEquivalenceFonction(texte, exercice.racineSimplifieeReference, CANDIDATS_X_POSITIF_A, TOLERANCE);
  if (equivalence !== "correct") return equivalence;
  if (contientRacineLitterale(texte)) return "not_equivalent";
  return "correct";
}
export function verifierAEcran2(exercice: ExerciceLongueurArcA, valeurs: string[]): boolean {
  return diagnostiquerAEcran2(exercice, valeurs) === "correct";
}

export function diagnostiquerAEcran3(exercice: ExerciceLongueurArcA, valeurs: string[]): StatutVerification {
  const longueur = exercice.primitiveReference(exercice.b) - exercice.primitiveReference(exercice.a);
  return diagnostiquerValeur(valeurs[0], longueur, TOLERANCE);
}
export function verifierAEcran3(exercice: ExerciceLongueurArcA, valeurs: string[]): boolean {
  return diagnostiquerAEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B — Substitution t=√(x²+k²), bornes construites.
// ============================================================================

/** Points d'échantillonnage en t, TOUJOURS strictement > k (domaine réel de la substitution) —
 * décalés depuis `exercice.k`, jamais une liste fixe (mirroir `pointsBEcran3`/`pointsUPourC` de
 * `verificationCalculPrimitives.ts`, domaine dépendant des paramètres tirés). */
function pointsT(k: number): number[] {
  return [k + 0.4, k + 0.9, k + 1.5, k + 2.2, k + 3, k + 4, k + 5.2];
}

export function diagnostiquerBEcran1(exercice: ExerciceLongueurArcB, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(valeurs, [exercice.t1, exercice.t2], TOLERANCE);
}
export function verifierBEcran1(exercice: ExerciceLongueurArcB, valeurs: string[]): boolean {
  return diagnostiquerBEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerBEcran2(exercice: ExerciceLongueurArcB, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.integrandeEnTReference, pointsT(exercice.k), TOLERANCE, "t");
}
export function verifierBEcran2(exercice: ExerciceLongueurArcB, valeurs: string[]): boolean {
  return diagnostiquerBEcran2(exercice, valeurs) === "correct";
}

/** Réutilise `diagnostiquerPrimitive` de `verificationCalculPrimitives.ts` — voir en-tête de
 * fichier. */
export function diagnostiquerBEcran3(exercice: ExerciceLongueurArcB, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveEnTReference, pointsT(exercice.k), TOLERANCE, "t");
}
export function verifierBEcran3(exercice: ExerciceLongueurArcB, valeurs: string[]): boolean {
  return diagnostiquerBEcran3(exercice, valeurs) === "correct";
}

export function diagnostiquerBEcran4(exercice: ExerciceLongueurArcB, valeurs: string[]): StatutVerification {
  const longueur = exercice.primitiveEnTReference(exercice.t2) - exercice.primitiveEnTReference(exercice.t1);
  return diagnostiquerValeur(valeurs[0], longueur, TOLERANCE);
}
export function verifierBEcran4(exercice: ExerciceLongueurArcB, valeurs: string[]): boolean {
  return diagnostiquerBEcran4(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille C — Cas simple, substitution directe.
// ============================================================================

const CANDIDATS_X_POSITIF_C = [0.3, 0.8, 1.3, 1.9, 2.6, 3.2, 3.9, 4.5];

export function diagnostiquerCEcran1(exercice: ExerciceLongueurArcC, valeurs: string[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(valeurs[0], exercice.unPlusFPrimeCarreReference, CANDIDATS_X_POSITIF_C, TOLERANCE);
}
export function verifierCEcran1(exercice: ExerciceLongueurArcC, valeurs: string[]): boolean {
  return diagnostiquerCEcran1(exercice, valeurs) === "correct";
}

/** Réutilise `diagnostiquerPrimitive` — même raisonnement que l'écran 3 de la famille B. */
export function diagnostiquerCEcran2(exercice: ExerciceLongueurArcC, valeurs: string[]): StatutVerification {
  return diagnostiquerPrimitive(valeurs[0], exercice.primitiveReference, CANDIDATS_X_POSITIF_C, TOLERANCE);
}
export function verifierCEcran2(exercice: ExerciceLongueurArcC, valeurs: string[]): boolean {
  return diagnostiquerCEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — spec : tolérance de vérification symbolique/numérique, le résultat n'étant pas
 * nécessairement une forme fermée "propre" (puissances fractionnaires) — `diagnostiquerValeur`
 * (comparaison numérique à tolérance fixe, déjà tolérante à N'IMPORTE QUELLE forme équivalente,
 * jamais une forme unique imposée) convient EXACTEMENT tel quel, aucune brique supplémentaire
 * nécessaire — CONTRASTE explicite avec `diagnostiquerAEcran2` (voir en-tête de fichier). */
export function diagnostiquerCEcran3(exercice: ExerciceLongueurArcC, valeurs: string[]): StatutVerification {
  const longueur = exercice.primitiveReference(exercice.b) - exercice.primitiveReference(exercice.a);
  return diagnostiquerValeur(valeurs[0], longueur, TOLERANCE);
}
export function verifierCEcran3(exercice: ExerciceLongueurArcC, valeurs: string[]): boolean {
  return diagnostiquerCEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique (mirroir 6gen23/6gen26).
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceLongueurArcA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceLongueurArcA, valeurs);
    case "aEcran3":
      return diagnostiquerAEcran3(exercice as ExerciceLongueurArcA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceLongueurArcB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceLongueurArcB, valeurs);
    case "bEcran3":
      return diagnostiquerBEcran3(exercice as ExerciceLongueurArcB, valeurs);
    case "bEcran4":
      return diagnostiquerBEcran4(exercice as ExerciceLongueurArcB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceLongueurArcC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceLongueurArcC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceLongueurArcC, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
