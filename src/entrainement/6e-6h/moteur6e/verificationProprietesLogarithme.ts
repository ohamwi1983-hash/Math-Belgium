import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen13`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationProprietesLogarithme.test.ts` pour la preuve avec des exercices factices définis
 * localement (même principe que `verificationExponentiellesProblemes.ts`, 6gen12).
 *
 * **Écran 1 — pas de bibliothèque d'algèbre symbolique** (aucune installée sur ce projet, "vérif.
 * symbolique" des specs source désigne en réalité l'échantillonnage numérique déjà en place partout
 * ailleurs sur la plateforme) : la base `a` n'est jamais résolue, donc `m=log_a(M)` et
 * `n=log_a(N)` sont traités comme 2 VARIABLES LIBRES INDÉPENDANTES — exactement les 2 noms déjà
 * utilisés côté génération/affichage. `diagnostiquerEquivalenceLogarithme` échantillonne plusieurs
 * paires `(m,n)` indépendantes et compare le texte élève (évalué par
 * `evaluerExpressionExponentielle`, déjà MULTI-VARIABLE) à une référence fermée `(m,n)=>number` —
 * copie LOCALE à 2 variables de `diagnostiquerEquivalenceFonction`
 * (`equivalenceExponentielle.ts`, 1 seule variable) : fonction NOUVELLE, jamais une modification du
 * fichier partagé dont dépendent inchangés les autres générateurs du chapitre 2.
 *
 * **Écran 2** — simple valeur numérique substituée : réutilise `diagnostiquerValeur` (moteur→
 * moteur, déjà établi) avec la référence de l'écran 1 évaluée aux VRAIES valeurs `exercice.m`/
 * `exercice.n` (jamais une valeur re-saisie par l'élève à l'écran précédent).
 *
 * **Tolérances** :
 * - `TOLERANCE_EXPRESSION` (0,01) — comparaison ALGÉBRIQUE écran 1 : `m`,`n` sont des variables
 *   libres échantillonnées sur des points variés, une expression juste correspond à la référence à
 *   la précision flottante près, une expression fausse (mauvaise propriété appliquée) s'en écarte
 *   largement — même raisonnement que `TOLERANCE_EXPRESSION` de
 *   `verificationExponentiellesProblemes.ts`.
 * - `TOLERANCE_VALEUR` (0,005) — valeur numérique finale de l'écran 2 : `m`/`n` sont donnés avec 3
 *   décimales EXACTES (jamais elles-mêmes ré-arrondies pour l'affichage, contrairement à
 *   `v2Affiche` de 6gen12), donc aucune erreur d'arrondi ne se propage depuis la donnée — la seule
 *   source d'écart possible est le calcul MANUEL de l'élève (division/produit à la main) ; ±0,005
 *   (borne haute de la fourchette ±0,002-0,005 suggérée pour ce générateur) couvre un arrondi
 *   intermédiaire raisonnable sans jamais accepter une vraie erreur de méthode (un écart dû à une
 *   mauvaise propriété appliquée à l'écran 1 est typiquement très supérieur à 0,005, vu que
 *   `m,n∈[1;9,999]`).
 */
const TOLERANCE_EXPRESSION = 0.01;
const TOLERANCE_VALEUR = 0.005;

/** 7 paires `(m,n)` FIXES et variées (positives/négatives, décimales) — suffisant pour distinguer
 * toute paire de propriétés confondues (produit/puissance, m-n/n-m, etc.). Jamais liées aux plages
 * de génération réelles (1 à 9,999) : ici `m`/`n` sont de simples variables libres, leur "sens"
 * logarithmique n'a aucune incidence sur la vérification algébrique. */
const POINTS_M = [1.234, 5.5, -0.375, 8.9, 2.02, 6.66, 0.1];
const POINTS_N = [2.876, -1.25, 4.4, 0.5, 9.99, -3.33, 7.77];

/**
 * Compare un texte (variables libres `m`,`n`) à une référence fermée `reference(m,n)`, en
 * échantillonnant plusieurs paires indépendantes — jamais de bibliothèque d'algèbre symbolique
 * (voir en-tête de fichier). Copie LOCALE à 2 variables de `diagnostiquerEquivalenceFonction`.
 */
export function diagnostiquerEquivalenceLogarithme(texte: string, reference: (m: number, n: number) => number, tolerance: number = TOLERANCE_EXPRESSION): StatutVerification {
  let comparables = 0;
  for (let i = 0; i < POINTS_M.length; i++) {
    const m = POINTS_M[i];
    const n = POINTS_N[i];
    const attendu = reference(m, n);
    if (!Number.isFinite(attendu)) continue;
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(texte, { m, n });
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

/** Référence algébrique de l'écran 1 — DISPATCH sur le type de question, `(m,n)` restent des
 * variables libres. Réutilisée telle quelle pour l'écran 2 (évaluée aux VRAIES valeurs
 * `exercice.m`/`exercice.n`). */
export function referenceEcran1(exercice: ExerciceProprieteLogarithme): (m: number, n: number) => number {
  switch (exercice.type) {
    case "produit":
      return (m, n) => m + n;
    case "quotient":
      return (m, n) => m - n;
    case "puissance":
      return (m) => exercice.p * m;
    case "racine":
      return (_m, n) => n / exercice.k;
    case "compose":
      return exercice.sousType === "racineQuotient" ? (m, n) => (m - n) / exercice.k : (m, n) => exercice.p * m + n;
  }
}

export function diagnostiquerEcran1(exercice: ExerciceProprieteLogarithme, texte: string): StatutVerification {
  return diagnostiquerEquivalenceLogarithme(texte, referenceEcran1(exercice));
}

export function diagnostiquerEcran2(exercice: ExerciceProprieteLogarithme, texte: string): StatutVerification {
  const cible = referenceEcran1(exercice)(exercice.m, exercice.n);
  return diagnostiquerValeur(texte, cible, TOLERANCE_VALEUR);
}

export function verifierEcran1(exercice: ExerciceProprieteLogarithme, texte: string): boolean {
  return diagnostiquerEcran1(exercice, texte) === "correct";
}

export function verifierEcran2(exercice: ExerciceProprieteLogarithme, texte: string): boolean {
  return diagnostiquerEcran2(exercice, texte) === "correct";
}
