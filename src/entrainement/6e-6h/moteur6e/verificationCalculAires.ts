import type { ExerciceAireA, ExerciceAireB, ExerciceAireC, ExerciceAireD, ExerciceCalculAires, SigneFonction } from "../core6e/calculAires.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquivalenceFonction, diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseCalculAires } from "./typesCalculAires";

/**
 * Couche B (6e) — vérification pour `6gen26` ("Calcul d'aires par intégrale", chapitre 4). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `verificationCalculAires.test.ts` (fixtures locales factices) et
 * `generateurs6e/calculAires/session.integration.test.ts` (seul fichier autorisé Couche A + Couche
 * B) pour la preuve.
 *
 * Réutilise `diagnostiquerValeur`/`diagnostiquerEquivalenceFonction`/`diagnostiquerEnsembleValeurs`
 * (`moteur6e/equivalenceExponentielle.ts`, jamais modifié) — mêmes briques que 6gen23 et le reste du
 * chantier. Convention de signature identique à 6gen23 : TOUT écran prend `(exercice, valeurs:
 * string[])`, y compris les champs "choix" (signe/ordre), transmis comme la chaîne de leur valeur
 * (`"positif"`/`"negatif"`/`"fSurG"`/`"gSurF"`) — un dispatcher générique unique côté
 * `sessionCalculAires.ts`/`App6gen26.tsx`, jamais ~13 fonctions de soumission bespoke.
 */

const TOLERANCE = 0.01;

function pireStatut(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

/** Champ "choix" (signe/ordre) — jamais de saisie libre, comparaison stricte à la valeur correcte
 * (jamais de `parse_error`, réservé aux erreurs de SYNTAXE d'une expression libre). */
function diagnostiquerChoix(soumis: string, correct: string): StatutVerification {
  return soumis === correct ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A — Aire courbe/axe, bornes données, signe constant.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceAireA, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], exercice.signe);
}
export function verifierAEcran1(exercice: ExerciceAireA, valeurs: string[]): boolean {
  return diagnostiquerAEcran1(exercice, valeurs) === "correct";
}

function aireSurABAvecPrimitive(a: number, b: number, primitiveReference: (x: number) => number): number {
  return Math.abs(primitiveReference(b) - primitiveReference(a));
}

export function diagnostiquerAEcran2(exercice: ExerciceAireA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], aireSurABAvecPrimitive(exercice.a, exercice.b, exercice.primitiveReference), TOLERANCE);
}
export function verifierAEcran2(exercice: ExerciceAireA, valeurs: string[]): boolean {
  return diagnostiquerAEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B — Aire courbe/axe, bornes à trouver, signe constant.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceAireB, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(valeurs, [exercice.r1, exercice.r2], TOLERANCE);
}
export function verifierBEcran1(exercice: ExerciceAireB, valeurs: string[]): boolean {
  return diagnostiquerBEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerBEcran2(exercice: ExerciceAireB, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], exercice.signe);
}
export function verifierBEcran2(exercice: ExerciceAireB, valeurs: string[]): boolean {
  return diagnostiquerBEcran2(exercice, valeurs) === "correct";
}

export function diagnostiquerBEcran3(exercice: ExerciceAireB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], aireSurABAvecPrimitive(exercice.r1, exercice.r2, exercice.primitiveReference), TOLERANCE);
}
export function verifierBEcran3(exercice: ExerciceAireB, valeurs: string[]): boolean {
  return diagnostiquerBEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille C — Signe changeant, découper et sommer (piège central).
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceAireC, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(valeurs, [exercice.r1, exercice.r2, exercice.r3], TOLERANCE);
}
export function verifierCEcran1(exercice: ExerciceAireC, valeurs: string[]): boolean {
  return diagnostiquerCEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — valeurs=[signeGauche, signeDroit]. */
export function diagnostiquerCEcran2(exercice: ExerciceAireC, valeurs: string[]): StatutVerification {
  return pireStatut(diagnostiquerChoix(valeurs[0], exercice.signeGauche), diagnostiquerChoix(valeurs[1], exercice.signeDroit));
}
export function verifierCEcran2(exercice: ExerciceAireC, valeurs: string[]): boolean {
  return diagnostiquerCEcran2(exercice, valeurs) === "correct";
}

/** Compare une valeur numérique soumise à une cible SIGNÉE, en imposant EN PLUS que le signe soumis
 * corresponde au signe attendu (garde-fou explicite demandé par la spec — voir en-tête de fichier,
 * "cross-check" écran 2/écran 3 de la famille C) : une réponse dont la valeur serait proche de la
 * bonne magnitude mais du mauvais signe est rejetée AVANT même la comparaison de tolérance. */
function diagnostiquerValeurSigneeC(texte: string, cible: number, signeAttendu: SigneFonction, tolerance: number = TOLERANCE): StatutVerification {
  const v = evaluerValeurExponentielle(texte);
  if (v === null) return "parse_error";
  const signeSoumisCorrespond = signeAttendu === "positif" ? v > 0 : v < 0;
  if (!signeSoumisCorrespond) return "not_equivalent";
  return Math.abs(v - cible) <= tolerance ? "correct" : "not_equivalent";
}

function integralesSousIntervallesC(exercice: ExerciceAireC): { iGauche: number; iDroit: number } {
  return {
    iGauche: exercice.primitiveReference(exercice.r2) - exercice.primitiveReference(exercice.r1),
    iDroit: exercice.primitiveReference(exercice.r3) - exercice.primitiveReference(exercice.r2),
  };
}

/** Écran 3 — valeurs=[intégrale sur ]r1,r2[, intégrale sur ]r2,r3[], chacune SIGNÉE — la cible de
 * chaque champ porte déjà le signe correct (`primitiveReference(b)-primitiveReference(a)`), la garde
 * `diagnostiquerValeurSigneeC` vérifie EN PLUS explicitement la cohérence avec le signe confirmé à
 * l'écran 2 (voir sa doc). */
export function diagnostiquerCEcran3(exercice: ExerciceAireC, valeurs: string[]): StatutVerification {
  const { iGauche, iDroit } = integralesSousIntervallesC(exercice);
  return pireStatut(diagnostiquerValeurSigneeC(valeurs[0], iGauche, exercice.signeGauche), diagnostiquerValeurSigneeC(valeurs[1], iDroit, exercice.signeDroit));
}
export function verifierCEcran3(exercice: ExerciceAireC, valeurs: string[]): boolean {
  return diagnostiquerCEcran3(exercice, valeurs) === "correct";
}

/** Écran 4 — PIÈGE CENTRAL : l'aire totale est la somme des VALEURS ABSOLUES des 2 intégrales
 * correctes de l'écran 3 (jamais leur somme signée, qui redonnerait l'intégrale globale — voir
 * en-tête de fichier). La cible est calculée depuis les valeurs CORRECTES connues de l'exercice
 * (`integralesSousIntervallesC`), jamais depuis la saisie élève de l'écran précédent. */
export function diagnostiquerCEcran4(exercice: ExerciceAireC, valeurs: string[]): StatutVerification {
  const { iGauche, iDroit } = integralesSousIntervallesC(exercice);
  const aireTotale = Math.abs(iGauche) + Math.abs(iDroit);
  return diagnostiquerValeur(valeurs[0], aireTotale, TOLERANCE);
}
export function verifierCEcran4(exercice: ExerciceAireC, valeurs: string[]): boolean {
  return diagnostiquerCEcran4(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille D — Aire entre deux courbes, avec variante paramètre.
// ============================================================================

type ExerciceAireD_Courbes = Extract<ExerciceAireD, { sousType: "bornesDonnees" | "bornesATrouver" }>;
type ExerciceAireD_Parametre = Extract<ExerciceAireD, { sousType: "parametre" }>;

/** Écran 1 (sous-type "bornesATrouver" uniquement) — racines de f-g = bornes de l'aire. */
export function diagnostiquerDEcran1(exercice: ExerciceAireD_Courbes, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(valeurs, [exercice.r1, exercice.r2], TOLERANCE);
}
export function verifierDEcran1(exercice: ExerciceAireD_Courbes, valeurs: string[]): boolean {
  return diagnostiquerDEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerDEcran2(exercice: ExerciceAireD, valeurs: string[]): StatutVerification {
  return diagnostiquerChoix(valeurs[0], exercice.ordre);
}
export function verifierDEcran2(exercice: ExerciceAireD, valeurs: string[]): boolean {
  return diagnostiquerDEcran2(exercice, valeurs) === "correct";
}

const CANDIDATS_M_POSITIFS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8];

/** Écran 3 — valeur numérique (sous-types "bornesDonnees"/"bornesATrouver") OU expression EN m
 * (sous-type "parametre", vérifiée par équivalence de fonction — voir en-tête de fichier). */
export function diagnostiquerDEcran3(exercice: ExerciceAireD, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "parametre") {
    return diagnostiquerEquivalenceFonction(valeurs[0], exercice.aireDeMReference, CANDIDATS_M_POSITIFS, TOLERANCE, "m");
  }
  return diagnostiquerValeur(valeurs[0], aireSurABAvecPrimitive(exercice.r1, exercice.r2, exercice.primitiveHReference), TOLERANCE);
}
export function verifierDEcran3(exercice: ExerciceAireD, valeurs: string[]): boolean {
  return diagnostiquerDEcran3(exercice, valeurs) === "correct";
}

/** Écran 4 (sous-type "parametre" uniquement) — valeur de m, comparée à la valeur RÉELLEMENT
 * choisie à la construction (convention "construire depuis la réponse", voir en-tête
 * `core6e/calculAires.types.ts` — jamais résolue symboliquement ici). */
export function diagnostiquerDEcran4(exercice: ExerciceAireD_Parametre, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], exercice.m, TOLERANCE);
}
export function verifierDEcran4(exercice: ExerciceAireD_Parametre, valeurs: string[]): boolean {
  return diagnostiquerDEcran4(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique (voir en-tête de fichier).
// ============================================================================

/** UNE SEULE fonction de vérification par écran, quel que soit `exercice.famille`/`phase` — mirroir
 * 6gen23 (`verificationCalculPrimitives.ts`). */
export function diagnostiquerEcran(exercice: ExerciceCalculAires, phase: PhaseCalculAires, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceAireA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceAireA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceAireB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceAireB, valeurs);
    case "bEcran3":
      return diagnostiquerBEcran3(exercice as ExerciceAireB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceAireC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceAireC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceAireC, valeurs);
    case "cEcran4":
      return diagnostiquerCEcran4(exercice as ExerciceAireC, valeurs);
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceAireD_Courbes, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceAireD, valeurs);
    case "dEcran3":
      return diagnostiquerDEcran3(exercice as ExerciceAireD, valeurs);
    case "dEcran4":
      return diagnostiquerDEcran4(exercice as ExerciceAireD_Parametre, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceCalculAires, phase: PhaseCalculAires, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
