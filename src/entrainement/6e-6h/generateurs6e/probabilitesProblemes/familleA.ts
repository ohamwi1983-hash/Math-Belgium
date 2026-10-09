import type { ExerciceFamilleA } from "../../core6e/probabilitesProblemes.types";

/**
 * Couche A (6e) — génération famille A ("Paradoxe des anniversaires") pour `6gen33`. n personnes,
 * n∈{4,...,8}, 365 jours (années bissextiles ignorées, spec).
 */

const N_A: readonly number[] = [4, 5, 6, 7, 8];

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Construction déterministe (`n` fixé) — utilisée par `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. */
export function construireFamilleA(n: number): ExerciceFamilleA {
  return { famille: "A", n };
}

export function genererFamilleA(): ExerciceFamilleA {
  return construireFamilleA(tirerParmi(N_A));
}

// ============================================================================
// Calculs purs — réutilisés par les TESTS de ce fichier et par `moteur6e/
// verificationProbabilitesProblemes.ts` (Couche B, recalcule ces MÊMES quantités indépendamment —
// jamais importées directement d'ici, voir `session.integration.test.ts`).
// ============================================================================

/** Écran 1 — le k-ième facteur (k=1,...,n-1) : P(la (k+1)-ième personne évite les k jours déjà
 * pris) = (365-k)/365. */
export function facteurEcran1(k: number): number {
  return (365 - k) / 365;
}

/** Tous les facteurs de l'écran 1, dans l'ordre, pour n personnes (longueur n-1). */
export function facteursEcran1(n: number): number[] {
  const facteurs: number[] = [];
  for (let k = 1; k <= n - 1; k++) facteurs.push(facteurEcran1(k));
  return facteurs;
}

/** Écran 2 — P(toutes différentes) = produit des n-1 facteurs. */
export function probToutesDifferentes(n: number): number {
  return facteursEcran1(n).reduce((acc, f) => acc * f, 1);
}

/** Écran 3 — P(au moins 2 identiques) = 1 − P(toutes différentes). */
export function probAuMoinsDeuxIdentiques(n: number): number {
  return 1 - probToutesDifferentes(n);
}
