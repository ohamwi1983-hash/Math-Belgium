import type { ExerciceFamilleA, QuestionEcran3FamilleA } from "../../core6e/tiragesArbres.types";

/**
 * Couche A (6e) — génération famille A ("Tirages avec/sans remise") pour `6gen31`. Urne à 2
 * couleurs (`n1`/`n2` boules), `k` tirages successifs avec ou sans remise. Toutes les probabilités
 * se calculent à la volée depuis `n1`/`n2`/`k`/`avecRemise`/`m` (entiers exacts stockés) — jamais un
 * flottant stocké directement (même convention que `core6e/probabilitesEnsembles.types.ts`).
 */

const EFFECTIFS_A: readonly number[] = [4, 5, 6, 7];
const K_A: readonly number[] = [2, 3];
const LABELS_COULEURS: readonly [string, string][] = [
  ["rouges", "bleues"],
  ["vertes", "jaunes"],
  ["noires", "blanches"],
  ["rouges", "vertes"],
];

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Construction déterministe (`avecRemise`/`k` fixés, tout le reste tiré au hasard) — utilisée par
 * `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. Écran 3 (audit 6e ch. 6, variété) : « exactement
 * m » (0 < m < k) ou « au moins une » (par l'événement contraire), tiré au hasard si non imposé. */
export function construireFamilleA(avecRemise: boolean, k: number, questionEcran3?: QuestionEcran3FamilleA): ExerciceFamilleA {
  const n1 = tirerParmi(EFFECTIFS_A);
  const n2 = tirerParmi(EFFECTIFS_A);
  const [labelCouleur1, labelCouleur2] = tirerParmi(LABELS_COULEURS);
  const m = tirerEntier(1, k - 1);
  const question = questionEcran3 ?? tirerParmi(["exactement", "auMoinsUne"] as const);
  return { famille: "A", n1, n2, labelCouleur1, labelCouleur2, k, avecRemise, m, questionEcran3: question };
}

/** Tirage ÉQUIPROBABLE de `avecRemise` ET de `k`. */
export function genererFamilleA(): ExerciceFamilleA {
  return construireFamilleA(Math.random() < 0.5, tirerParmi(K_A));
}

// ============================================================================
// Calculs purs — réutilisés par les TESTS de ce fichier pour affirmer la cohérence de la
// génération. `moteur6e/verificationTiragesArbres.ts` recalcule ces MÊMES quantités
// INDÉPENDAMMENT (jamais importées d'ici — règle non négociable CLAUDE.md, `moteur6e/` n'importe
// jamais `generateurs6e/`).
// ============================================================================

function factorielle(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function coefficientBinomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return factorielle(n) / (factorielle(k) * factorielle(n - k));
}

/** P(k tirages de la couleur d'effectif `nCouleur`, l'autre couleur ayant `nAutre`), écran 1. */
export function probMemeCouleur(nCouleur: number, nAutre: number, k: number, avecRemise: boolean): number {
  const n = nCouleur + nAutre;
  if (avecRemise) return Math.pow(nCouleur / n, k);
  let produit = 1;
  for (let i = 0; i < k; i++) produit *= (nCouleur - i) / (n - i);
  return produit;
}

/** P("exactement m boules de couleur 1"), écran 3 — LA formule dépend du mode de tirage (piège
 * central de la spec, jamais interchangeable). */
export function probExactementM(ex: ExerciceFamilleA): number {
  if (ex.questionEcran3 === "auMoinsUne") return 1 - probMemeCouleur(ex.n2, ex.n1, ex.k, ex.avecRemise);
  const n = ex.n1 + ex.n2;
  if (ex.avecRemise) {
    const p = ex.n1 / n;
    return coefficientBinomial(ex.k, ex.m) * Math.pow(p, ex.m) * Math.pow(1 - p, ex.k - ex.m);
  }
  return (coefficientBinomial(ex.n1, ex.m) * coefficientBinomial(ex.n2, ex.k - ex.m)) / coefficientBinomial(n, ex.k);
}
