import { calculerEtatsArgument, etatVersValeur, valeurReelleEtatFinal } from "../core6e/decompositionLogarithme";
import type { VariablesLibres } from "../core6e/decompositionLogarithme";
import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import { estEcranNumerique } from "./typesProprietesLogarithme";
import type { PhaseProprietesLogarithme } from "./typesProprietesLogarithme";

/**
 * Couche B (6e) — vérification pour `6gen13`, REFONTE TOTALE. Toujours **pas de bibliothèque
 * d'algèbre symbolique** (aucune installée sur ce projet) : m/n/q/r/c (voir
 * `core6e/decompositionLogarithme.ts`) restent des VARIABLES LIBRES INDÉPENDANTES échantillonnées à
 * plusieurs points fixes, comparées à une référence fermée `(vars) => number` — même principe que
 * l'ancienne version, étendu de 2 variables libres (m,n) à 5 (m,n,q,r,c), TOUJOURS fournies toutes
 * les 5 même quand une exercice donné n'en utilise qu'une partie (les variables non référencées
 * dans le texte élève sont simplement ignorées par l'évaluateur — jamais besoin de calculer au
 * préalable lesquelles sont "pertinentes" pour cet exercice précis).
 *
 * **Écrans algébriques** (tous sauf le dernier) — référence = l'état de décomposition CIBLE de
 * cette étape (voir `core6e/decompositionLogarithme.ts::calculerEtatsArgument`), ou, pour l'étape de
 * changement de base (toujours la dernière étape algébrique quand elle existe), l'état final
 * multiplié par `c`.
 * **Écran numérique final** — valeur CIBLE unique (pas une fonction), recalculée PUREMENT depuis les
 * vraies valeurs connues de l'exercice (`m`/`n`/`q`/`c`), jamais une saisie élève d'un écran
 * précédent.
 *
 * **Tolérances** — mêmes valeurs et même raisonnement que la version précédente :
 * - `TOLERANCE_EXPRESSION` (0,01) pour les écrans algébriques (variables libres échantillonnées).
 * - `TOLERANCE_VALEUR` (0,005) pour l'écran numérique final (m/n/q/c donnés à 3 décimales EXACTES,
 *   seule source d'écart possible : un arrondi intermédiaire raisonnable du calcul élève).
 */
const TOLERANCE_EXPRESSION = 0.01;
const TOLERANCE_VALEUR = 0.005;

/** 7 valeurs FIXES et variées (positives/négatives, décimales) par variable libre — jamais liées
 * aux plages de génération réelles (1 à 9,999) : ici ce sont de simples variables libres, leur
 * "sens" logarithmique n'a aucune incidence sur la vérification algébrique. Des jeux DIFFÉRENTS par
 * variable (jamais le même tableau réutilisé) pour qu'une confusion entre deux variables libres
 * (ex. élève qui écrit `n` au lieu de `q`) soit bien détectée par l'échantillonnage. */
const POINTS_M = [1.234, 5.5, -0.375, 8.9, 2.02, 6.66, 0.1];
const POINTS_N = [2.876, -1.25, 4.4, 0.5, 9.99, -3.33, 7.77];
const POINTS_Q = [3.333, 0.8, -2.5, 6.123, 1.01, -5.5, 4.44];
const POINTS_R = [4.567, -0.6, 7.25, 1.11, -3.8, 5.05, 0.99];
const POINTS_C = [1.789, 3.14, -1.1, 0.654, 8.2, -2.22, 6.05];

/** Compare un texte (variables libres m,n,q,r,c) à une référence fermée, en échantillonnant 7
 * points indépendants — jamais de bibliothèque d'algèbre symbolique (voir en-tête de fichier). */
export function diagnostiquerEquivalenceLogarithme(
  texte: string,
  reference: (vars: VariablesLibres) => number,
  tolerance: number = TOLERANCE_EXPRESSION,
): StatutVerification {
  let comparables = 0;
  for (let i = 0; i < POINTS_M.length; i++) {
    const vars: VariablesLibres = { m: POINTS_M[i], n: POINTS_N[i], q: POINTS_Q[i], r: POINTS_R[i], c: POINTS_C[i] };
    const attendu = reference(vars);
    if (!Number.isFinite(attendu)) continue;
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(texte, vars as unknown as Record<string, number>);
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(soumis)) return "not_equivalent";
    comparables++;
    if (Math.abs(soumis - attendu) > tolerance) return "not_equivalent";
  }
  const minimumRequis = Math.min(3, POINTS_M.length);
  if (comparables < minimumRequis) return "parse_error";
  return "correct";
}

/** Référence (fonction de variables libres) de l'écran algébrique `phase` — jamais appelée sur
 * l'écran numérique final (voir `referenceEcranNumerique`). */
export function referenceEcranAlgebrique(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): (vars: VariablesLibres) => number {
  const etats = calculerEtatsArgument(exercice.arbre);
  const etapesArgument = etats.length - 1;
  if (phase < etapesArgument) {
    const etatCible = etats[phase + 1];
    return (vars) => etatVersValeur(etatCible, vars);
  }
  // Étape de changement de base — toujours la DERNIÈRE étape algébrique quand elle existe
  // (`phase === etapesArgument`), jamais atteinte autrement (garde-fou côté appelant).
  const etatFinal = etats[etapesArgument];
  return (vars) => etatVersValeur(etatFinal, vars) * (vars.c as number);
}

/** Valeur CIBLE unique de l'écran numérique final — recalculée depuis les vraies valeurs connues de
 * l'exercice, jamais une saisie élève. */
export function referenceEcranNumerique(exercice: ExerciceProprieteLogarithme): number {
  const etats = calculerEtatsArgument(exercice.arbre);
  const etatFinal = etats[etats.length - 1];
  const valeurArgument = valeurReelleEtatFinal(etatFinal, { m: exercice.m, n: exercice.n, q: exercice.q });
  return exercice.avecChangementBase ? valeurArgument * (exercice.c as number) : valeurArgument;
}

export function diagnostiquerEcran(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme, texte: string): StatutVerification {
  if (estEcranNumerique(exercice, phase)) {
    return diagnostiquerValeur(texte, referenceEcranNumerique(exercice), TOLERANCE_VALEUR);
  }
  return diagnostiquerEquivalenceLogarithme(texte, referenceEcranAlgebrique(exercice, phase));
}

export function verifierEcran(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme, texte: string): boolean {
  return diagnostiquerEcran(exercice, phase, texte) === "correct";
}
