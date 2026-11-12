import type { ContexteFamilleB, DemandeEcran1FamilleB, DemandeEcran4FamilleB, ExerciceFamilleB } from "../../core6e/tiragesArbres.types";

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
 * par `CATALOGUE_VARIANTES`/`construireAvecVarianteId` et par `6gen33` (famille G, n = 4).
 * Audit 6e ch. 6 :
 * - « deux positions fixées » est remplacé par « une » quand n = 3 (c'est alors « tout est bien
 *   placé », la question de l'écran 2) ;
 * - k (écran 3) vérifie 1 ≤ k ≤ n − 2 ET n − k ≤ 3 : les objets restants, tous mal placés, se
 *   comptent sur un petit arbre (1 façon pour 2 objets, 2 pour 3) — jamais les 9 façons de mal
 *   placer 4 objets, ni une formule de dénombrement du chapitre suivant ;
 * - écran 4 : « aucune bien placée » pour n ≤ 4, « au moins 3 bien placées » pour n = 5 (44
 *   arrangements sans point fixe sur 120 ne se comptent pas raisonnablement à la main). */
export function construireFamilleB(n: number, demandeEcran1: DemandeEcran1FamilleB): ExerciceFamilleB {
  const contexte = tirerParmi(CONTEXTES_B);
  const demande: DemandeEcran1FamilleB = n <= 3 ? "une" : demandeEcran1;
  const positionsEcran1 = tirerPositionsDistinctes(n, demande === "une" ? 1 : 2).sort((x, y) => x - y);
  const k = tirerEntier(Math.max(1, n - 3), n - 2);
  const demandeEcran4: DemandeEcran4FamilleB = n >= 5 ? "auMoinsTrois" : "aucune";
  return { famille: "B", n, contexte, demandeEcran1: demande, positionsEcran1, k, demandeEcran4 };
}

/** Tirage de `n` puis de `demandeEcran1` (« deux » seulement si n ≥ 4). */
export function genererFamilleB(): ExerciceFamilleB {
  const n = tirerParmi(N_B);
  return construireFamilleB(n, n <= 3 ? "une" : tirerParmi(["une", "deux"] as const));
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

/** Écran 4, n = 5 — P(au moins 3 bien placées) = P(exactement 3) + P(exactement 5) (exactement 4
 * est impossible). */
export function probAuMoinsTroisCorrectes(n: number): number {
  let total = 0;
  for (let j = 3; j <= n; j++) total += probExactementKCorrectes(n, j);
  return total;
}
