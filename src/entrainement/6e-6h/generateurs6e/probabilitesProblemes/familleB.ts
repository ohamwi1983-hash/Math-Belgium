import type { ContexteFamilleB, DemandeEcran3FamilleB, ExerciceFamilleB } from "../../core6e/probabilitesProblemes.types";

/**
 * Couche A (6e) — génération famille B (« épreuves répétées ») pour `6gen33`. n épreuves identiques
 * et indépendantes (n∈{3,4,5}), probabilité de succès p donnée. Audit 6e ch. 6 (décision G) : le
 * cours ne connaît pas C(n,k) — le nombre de chemins à k succès se COMPTE dans l'arbre, par
 * énumération (n ≤ 5). Aucun texte de ce générateur ne nomme un coefficient.
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

/** Nombre de chemins de l'arbre (suites de n résultats S/É) comportant exactement k succès —
 * compté par ÉNUMÉRATION des 2ⁿ chemins (n ≤ 5), comme l'élève le fait dans l'arbre. */
export function nombreCheminsKSucces(n: number, k: number): number {
  let total = 0;
  for (let chemin = 0; chemin < 2 ** n; chemin++) {
    let succes = 0;
    for (let i = 0; i < n; i++) if ((chemin >> i) & 1) succes++;
    if (succes === k) total++;
  }
  return total;
}

/** Écran 2 — P(exactement k succès) = (nombre de chemins)·p^k·(1−p)^(n−k). */
export function probExactementK(n: number, p: number, k: number): number {
  return nombreCheminsKSucces(n, k) * p ** k * (1 - p) ** (n - k);
}

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
