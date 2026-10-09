import type { ExerciceDenombCombA } from "../../core6e/denombrementCombine.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Répartition en groupes de tailles données — multinomiale")
 * de `6gen44`. `n`∈{20,...,52} personnes réparties en `k`∈{2,3,4} groupes NOMMÉS, de tailles
 * DISTINCTES sommant à `n`. `resultat = n!/(n1!·n2!·...·nk!)`.
 *
 * ============================================================================
 * **`resultat` en BigInt — PAS `generateurs6e/combinatoire.ts` (`factorielle`/`coefficientBinomial`,
 * qui retournent `number`)**
 * ============================================================================
 * Vérifié empiriquement (voir aussi l'en-tête de `moteur6e/expressionCombinatoire.ts`, qui affronte
 * le même problème côté vérification) : pour `n` jusqu'à 52 réparti en 3-4 groupes, la multinomiale
 * dépasse très largement `Number.MAX_SAFE_INTEGER` (`2^53`, ≈9×10^15) — ex. `52!/(17!·17!·18!) ≈
 * 9.96×10^22`. Aucune fonction basée sur `number` (y compris `coefficientBinomial` de
 * `combinatoire.ts`, dont l'algorithme itératif est pourtant précis pour DE PLUS PETITES valeurs) ne
 * peut représenter un tel résultat exactement — un double n'a que ~15-17 chiffres significatifs.
 * `resultat` est donc calculé ici via un petit trio LOCAL en BigInt (`factorielleBigInt`/
 * `coefficientBinomialBigInt`), DUPLIQUÉ délibérément de `combinatoire.ts` plutôt qu'importé —
 * même algorithme, juste une représentation numérique différente (précision arbitraire). Ce n'est
 * PAS une réimplémentation de la LOGIQUE combinatoire (interdite par la mission), seulement un
 * changement de type numérique rendu nécessaire par l'amplitude de `n` demandée par CETTE famille —
 * `combinatoire.ts` reste la référence utilisée telle quelle par toutes les familles B/C/D de ce
 * même générateur (n plus petit, `number` largement suffisant, voir leurs fichiers).
 */

const N_MIN = 20;
const N_MAX = 52;
const K_VALEURS = [2, 3, 4] as const;
const NOMS_GROUPES = ["Rouge", "Bleu", "Vert", "Jaune", "Orange", "Violet"];

function coefficientBinomialBigInt(n: bigint, k: bigint): bigint {
  if (k < 0n || k > n) return 0n;
  const kEff = k < n - k ? k : n - k;
  let resultat = 1n;
  for (let i = 0n; i < kEff; i++) {
    resultat = (resultat * (n - i)) / (i + 1n);
  }
  return resultat;
}

/** `n!/(n1!·n2!·...·nk!)` calculé comme un enchaînement de `C(reste, ni)` — jamais de grand
 * factoriel matérialisé directement, exact en BigInt quelle que soit l'amplitude. */
function multinomialBigInt(n: number, tailles: number[]): bigint {
  let reste = BigInt(n);
  let resultat = 1n;
  for (const taille of tailles) {
    resultat *= coefficientBinomialBigInt(reste, BigInt(taille));
    reste -= BigInt(taille);
  }
  return resultat;
}

/** `k` tailles DISTINCTES, strictement croissantes, sommant exactement à `n` — construction
 * déterministe (base `[r,r+1,...,r+k-1]` avec petit décalage aléatoire `r`∈{1,2,3}, puis le reste de
 * `n` réparti également + l'arrondi sur les `leftover` plus grandes tailles) qui PRÉSERVE la
 * distinction stricte : décaler TOUTES les tailles de la même quantité conserve l'écart de 1 entre
 * elles, et n'incrémenter que les `leftover` DERNIÈRES (les plus grandes) ne peut jamais créer de
 * collision avec la taille juste en-dessous (l'écart passe de 1 à 2, jamais à 0) — voir
 * `familleA.test.ts` pour la preuve par tirages exhaustifs (n∈[20,52], k∈{2,3,4}, toujours distinct
 * et sommant à n). */
export function tirerTaillesDistinctes(n: number, k: number): number[] {
  const r = tirerEntier(1, 3);
  const base = Array.from({ length: k }, (_, i) => r + i);
  const sommeBase = base.reduce((a, b) => a + b, 0);
  const remainder = n - sommeBase; // toujours ≥0 : sommeBase ≤ 3+4+5+6=18 < N_MIN=20
  const parEgal = Math.floor(remainder / k);
  const tailles = base.map((s) => s + parEgal);
  const leftover = remainder - parEgal * k;
  for (let i = k - 1; i >= k - leftover; i--) tailles[i] += 1;
  return tailles;
}

export function construireFamilleA(): ExerciceDenombCombA {
  const n = tirerEntier(N_MIN, N_MAX);
  const k = tirerParmi(K_VALEURS);
  const tailles = tirerTaillesDistinctes(n, k);
  const noms = [...NOMS_GROUPES].sort(() => Math.random() - 0.5).slice(0, k);
  const resultat = multinomialBigInt(n, tailles);
  return { famille: "A", n, k, noms, tailles, resultat };
}
