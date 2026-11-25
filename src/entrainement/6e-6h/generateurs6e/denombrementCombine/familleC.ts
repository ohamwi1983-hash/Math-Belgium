import { coefficientBinomial } from "../combinatoire";
import type { ExerciceDenombCombC } from "../../core6e/denombrementCombine.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Famille C de `6gen44` — combinaisons avec répétition Γₙᵖ = C₍ₙ₊ₚ₋₁₎ᵖ (audit, lot C : p de 2 à 4 —
 * avant, p valait toujours 2), et comparaison « objets discernables (nᵖ) ou indiscernables (Γₙᵖ) » :
 * le verdict est tiré à parts égales (avant, la réponse était toujours la même).
 */

export function gamma(n: number, p: number): number {
  return coefficientBinomial(n + p - 1, p);
}

export function construireRepetition(): ExerciceDenombCombC {
  const p = tirerParmi([2, 3, 4] as const);
  const n = tirerEntier(4, p === 4 ? 9 : 12);
  const contexte = tirerParmi([
    `Un glacier propose ${n} parfums. On compose une coupe de ${p} boules ; un même parfum peut être pris plusieurs fois, et l'ordre des boules dans la coupe ne compte pas.`,
    `Une boulangerie vend ${n} sortes de viennoiseries. On achète ${p} viennoiseries ; on peut prendre plusieurs fois la même sorte, seul compte le contenu du sachet.`,
    `On répartit ${p} jetons identiques dans ${n} boîtes numérotées (une boîte peut en recevoir plusieurs, ou aucun).`,
  ]);
  return { famille: "C", sousType: "repetition", discernables: false, contexte, n, p, resultat: gamma(n, p) };
}

export function construireComparaison(discernables: boolean = Math.random() < 0.5): ExerciceDenombCombC {
  const p = tirerParmi([2, 3] as const);
  const n = tirerParmi([4, 6, 8, 10, 12] as const);
  const couleurs = p === 2 ? "un rouge et un bleu" : "un rouge, un vert et un bleu";
  const contexte = discernables
    ? `On lance ${p} dés à ${n} faces de couleurs différentes (${couleurs}). Un résultat est la liste des faces obtenues, dé par dé.`
    : `On lance ${p} dés à ${n} faces identiques, que l'on ne peut pas distinguer. Un résultat est donc la collection des faces obtenues (une face peut apparaître plusieurs fois).`;
  return { famille: "C", sousType: "comparaison", discernables, contexte, n, p, resultat: discernables ? n ** p : gamma(n, p) };
}
