import type { ExerciceDenombCombE } from "../../core6e/denombrementCombine.types";
import { multinomial } from "./familleA";
import { tirerParmi } from "./aleatoire";

/**
 * Famille E de `6gen44` (audit 6e ch. 7, lot C : la carte annonçait les permutations avec répétition,
 * aucune variante ne les travaillait) — anagrammes d'un mot à lettres répétées : nombre de mots
 * n!/(n₁!·n₂!·…), puis d'anagrammes (on retire le mot lui-même). « Mississippi » rétabli (décision
 * de l'utilisateur : 11 lettres, 34 650 mots, 34 649 anagrammes).
 */

const MOTS = ["ANANAS", "BANANE", "PAPAYE", "COCOTTE", "ALABAMA", "CANCAN", "TOMATE", "BARBARA", "MISSISSIPPI", "ABRACADABRA", "PIPELINE", "ASSASSIN", "CARAMEL", "BOBINE"];

function repetitions(mot: string): { lettre: string; fois: number }[] {
  const comptes = new Map<string, number>();
  for (const c of mot) comptes.set(c, (comptes.get(c) ?? 0) + 1);
  return [...comptes.entries()].filter(([, f]) => f >= 2).map(([lettre, fois]) => ({ lettre, fois }));
}

export const MOTS_ANAGRAMMES = MOTS.filter((m) => repetitions(m).length > 0);

export function construireAnagrammes(mot: string = tirerParmi(MOTS_ANAGRAMMES)): ExerciceDenombCombE {
  const reps = repetitions(mot);
  return { famille: "E", mot, repetitions: reps, n: mot.length, nombreMots: multinomial(mot.length, [...new Set(mot)].map((c) => mot.split(c).length - 1)) };
}
