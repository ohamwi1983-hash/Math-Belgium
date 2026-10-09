import { coefficientBinomial } from "../combinatoire";
import type { ExerciceDenombCombB } from "../../core6e/denombrementCombine.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille B ("Sélections combinées indépendantes") de `6gen44`. 4
 * sous-types, toutes les valeurs restent largement sous `Number.MAX_SAFE_INTEGER` avec les plages
 * choisies ci-dessous (vérifié par tirages exhaustifs, `familleB.test.ts`) — `combinatoire.ts`
 * (`coefficientBinomial`) est donc réutilisé TEL QUEL, contrairement à la famille A (voir son
 * en-tête).
 *
 * ============================================================================
 * **Plages concrètes choisies** (documentées comme demandé par la mission)
 * ============================================================================
 * - "roleDistingue" (président + k vice-présidents) : `n`∈{10,...,30}, `k`∈{2,...,5}, `k≤n-3`.
 *   `resultat = n × C(n−1,k)`.
 * - "poolsSepares" (2 groupes indépendants, ET) : `n1,n2`∈{8,...,18}, `k1,k2`∈{2,...,4} (chacun
 *   `≤` son groupe). `resultat = C(n1,k1) × C(n2,k2)`.
 * - "memeContrainte" (2 groupes, OU exclusif, ex. « k personnes du même groupe ») : `n1,n2`∈
 *   {8,...,20} (tailles DISTINCTES pour éviter toute ambiguïté), `k`∈{2,...,4} (`≤min(n1,n2)`).
 *   `resultat = C(n1,k) + C(n2,k)`.
 * - "partitionComplementaire" : `n`∈{10,...,30}, `k`∈{3,...,8} (`≤n-3`, volontairement pas près de
 *   `n/2` pour garder un résultat lisible). `resultat = C(n,k)`.
 */

export function construireRoleDistingue(): ExerciceDenombCombB {
  const n = tirerEntier(10, 30);
  const k = tirerEntier(2, Math.min(5, n - 3));
  const resultat = n * coefficientBinomial(n - 1, k);
  return { famille: "B", sousType: "roleDistingue", n, k, resultat };
}

export function construirePoolsSepares(): ExerciceDenombCombB {
  const n1 = tirerEntier(8, 18);
  const n2 = tirerEntier(8, 18);
  const k1 = tirerEntier(2, Math.min(4, n1));
  const k2 = tirerEntier(2, Math.min(4, n2));
  const resultat = coefficientBinomial(n1, k1) * coefficientBinomial(n2, k2);
  return { famille: "B", sousType: "poolsSepares", n1, k1, n2, k2, resultat };
}

export function construireMemeContrainte(): ExerciceDenombCombB {
  let n1 = tirerEntier(8, 20);
  let n2 = tirerEntier(8, 20);
  while (n2 === n1) n2 = tirerEntier(8, 20); // tailles distinctes (mission : "éviter toute ambiguïté de symétrie")
  const k = tirerEntier(2, Math.min(4, n1, n2));
  const resultat = coefficientBinomial(n1, k) + coefficientBinomial(n2, k);
  return { famille: "B", sousType: "memeContrainte", n1, n2, k, resultat };
}

export function construirePartitionComplementaire(): ExerciceDenombCombB {
  const n = tirerEntier(10, 30);
  const k = tirerEntier(3, Math.min(8, n - 3));
  const resultat = coefficientBinomial(n, k);
  return { famille: "B", sousType: "partitionComplementaire", n, k, resultat };
}

const CONSTRUCTEURS_B: (() => ExerciceDenombCombB)[] = [construireRoleDistingue, construirePoolsSepares, construireMemeContrainte, construirePartitionComplementaire];

export function construireFamilleB(): ExerciceDenombCombB {
  return tirerParmi(CONSTRUCTEURS_B)();
}
