import type { ContexteFamilleB, DemandeEcran3FamilleB, ExerciceFamilleB } from "../../core6e/probabilitesProblemes.types";

/**
 * Couche A (6e) — génération famille B ("Loi binomiale") pour `6gen33`. n épreuves identiques
 * indépendantes (n∈{3,4,5}), probabilité de succès p DONNÉE.
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}
function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const CONTEXTES_B: readonly ContexteFamilleB[] = [
  { id: "tir", texte: "Un archer tire plusieurs flèches de manière indépendante, chaque tir ayant la même probabilité de succès.", labelSucces: "atteint la cible" },
  { id: "penalty", texte: "Un footballeur tire plusieurs penalties de manière indépendante, chaque tir ayant la même probabilité de succès.", labelSucces: "marque le but" },
  { id: "piece", texte: "On répète plusieurs fois une expérience à deux issues (succès/échec), les répétitions étant indépendantes.", labelSucces: "est un succès" },
];

const N_B: readonly number[] = [3, 4, 5];
const CANDIDATS_P: readonly number[] = [0.2, 0.3, 0.4, 0.6, 0.7, 0.8];
const DEMANDES_ECRAN3: readonly DemandeEcran3FamilleB[] = ["auMoinsK", "unDeChaqueResultat"];

/** Construction déterministe (`n`/`demandeEcran3` fixés) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. `k` toujours dans [1, n-1] (jamais 0 ni n, cas triviaux). */
export function construireFamilleB(n: number, demandeEcran3: DemandeEcran3FamilleB): ExerciceFamilleB {
  const contexte = tirerParmi(CONTEXTES_B);
  const p = tirerParmi(CANDIDATS_P);
  const k = tirerEntier(1, n - 1);
  return { famille: "B", contexte, n, p, k, demandeEcran3 };
}

export function genererFamilleB(): ExerciceFamilleB {
  return construireFamilleB(tirerParmi(N_B), tirerParmi(DEMANDES_ECRAN3));
}

// ============================================================================
// Calculs purs — réutilisés par les TESTS de ce fichier (voir `familleA.ts`, même principe).
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

/** Écrans 1/2 — P(exactement k succès) = C(n,k)·p^k·(1-p)^(n-k). Piège central de la spec : oublier
 * C(n,k) (compter une seule configuration au lieu de toutes celles menant à "exactement k succès"). */
export function probExactementK(n: number, p: number, k: number): number {
  return coefficientBinomial(n, k) * p ** k * (1 - p) ** (n - k);
}

/** Écran 3, variante "auMoinsK" — somme des termes de k à n. */
export function probAuMoinsK(n: number, p: number, k: number): number {
  let somme = 0;
  for (let i = k; i <= n; i++) somme += probExactementK(n, p, i);
  return somme;
}

/** Écran 3, variante "unDeChaqueResultat" — P(pas tous identiques) = 1 − P(tous succès) −
 * P(tous échecs) = 1 − p^n − (1-p)^n. */
export function probUnDeChaqueResultat(n: number, p: number): number {
  return 1 - p ** n - (1 - p) ** n;
}

/** Valeur finale de l'écran 3, selon la demande. */
export function valeurEcran3B(exercice: ExerciceFamilleB): number {
  return exercice.demandeEcran3 === "auMoinsK" ? probAuMoinsK(exercice.n, exercice.p, exercice.k) : probUnDeChaqueResultat(exercice.n, exercice.p);
}
