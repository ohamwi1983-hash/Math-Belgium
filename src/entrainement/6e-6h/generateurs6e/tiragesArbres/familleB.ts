import type { ContexteFamilleB, DemandeEcran1FamilleB, ExerciceFamilleB } from "../../core6e/tiragesArbres.types";

/**
 * Couche A (6e) — génération famille B ("Permutations et dérangements") pour `6gen31`. n éléments
 * (lettres/enveloppes ou chansons) arrangés aléatoirement, n∈{3,4,5}.
 *
 * **Table des dérangements D(0..5)** — spec fournit explicitement D(0..4)=[1,0,1,2,9] ("valeurs à
 * fournir dans l'aide si besoin") ; D(5)=44 (valeur STANDARD, récurrence D(n)=(n-1)(D(n-1)+D(n-2)))
 * est AJOUTÉE ici, au-delà de la liste littérale de la spec, car l'écran 4 ("aucune position
 * correcte" = D(n)/n!) en a structurellement besoin pour n=5 (le plus grand n généré par ce
 * générateur) — jamais recalculée par un algorithme général de dénombrement (convention explicite
 * de la spec, "juste la valeur à fournir"), une simple table étendue d'une entrée.
 */
export const DERANGEMENTS: readonly number[] = [1, 0, 1, 2, 9, 44];

export function derangement(n: number): number {
  if (n < 0 || n >= DERANGEMENTS.length) throw new Error(`derangement : n=${n} hors table`);
  return DERANGEMENTS[n];
}

function factorielle(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export { factorielle };

const N_B: readonly number[] = [3, 4, 5];
const CONTEXTES_B: readonly ContexteFamilleB[] = ["lettres", "chansons"];

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Tire `count` positions DISTINCTES parmi 1..n. */
function tirerPositionsDistinctes(n: number, count: number): number[] {
  const positions: number[] = [];
  while (positions.length < count) {
    const p = tirerEntier(1, n);
    if (!positions.includes(p)) positions.push(p);
  }
  return positions;
}

/** Construction déterministe (`n`/`demandeEcran1` fixés, tout le reste tiré au hasard) — utilisée
 * par `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. `k` (écran 3) tiré dans 1..n-2 (spec :
 * "jamais n−1, structurellement impossible"). */
export function construireFamilleB(n: number, demandeEcran1: DemandeEcran1FamilleB): ExerciceFamilleB {
  const contexte = tirerParmi(CONTEXTES_B);
  const positionsEcran1 = tirerPositionsDistinctes(n, demandeEcran1 === "une" ? 1 : 2);
  const k = tirerEntier(1, n - 2);
  return { famille: "B", n, contexte, demandeEcran1, positionsEcran1, k };
}

/** Tirage ÉQUIPROBABLE de `n` ET de `demandeEcran1`. */
export function genererFamilleB(): ExerciceFamilleB {
  return construireFamilleB(tirerParmi(N_B), tirerParmi(["une", "deux"] as const));
}

// ============================================================================
// Calculs purs — réutilisés par les TESTS de ce fichier (voir `familleA.ts`, même principe :
// `moteur6e/verificationTiragesArbres.ts` recalcule ces MÊMES quantités indépendamment).
// ============================================================================

export function coefficientBinomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return factorielle(n) / (factorielle(k) * factorielle(n - k));
}

/** Écran 1 — P(une position fixée) = (n-1)!/n! = 1/n ; P(deux positions fixées) = (n-2)!/n!. */
export function probPositionsFixees(n: number, demandeEcran1: DemandeEcran1FamilleB): number {
  return demandeEcran1 === "une" ? factorielle(n - 1) / factorielle(n) : factorielle(n - 2) / factorielle(n);
}

/** Écran 2 — P(arrangement entièrement correct) = 1/n!. */
export function probToutCorrect(n: number): number {
  return 1 / factorielle(n);
}

/** Écran 3 — P(exactement k positions correctes) = C(n,k)·D(n-k)/n! (piège : les n-k positions
 * restantes doivent former un DÉRANGEMENT COMPLET, jamais un arrangement quelconque). */
export function probExactementKCorrectes(n: number, k: number): number {
  return (coefficientBinomial(n, k) * derangement(n - k)) / factorielle(n);
}

/** Écran 4 — P(aucune position correcte) = D(n)/n!. */
export function probAucuneCorrecte(n: number): number {
  return derangement(n) / factorielle(n);
}
