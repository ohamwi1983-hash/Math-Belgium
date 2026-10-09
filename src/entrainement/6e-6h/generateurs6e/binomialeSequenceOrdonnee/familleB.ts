import type { ContexteBinomialeB, ExerciceBinomialeB } from "../../core6e/binomialeSequenceOrdonnee.types";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération famille B ("Probabilité d'une séquence exacte, sans remise, éléments
 * distincts") pour `6gen48`. `n` éléments TOUS DISTINCTS, on en tire `k` successivement SANS
 * REMISE, dans un ORDRE PRÉCIS donné : à chaque tirage, un seul élément parmi ceux restants
 * correspond à la position exacte demandée — probabilité `1/(nombre d'éléments restants)` à chaque
 * étape, d'où le produit `1/n · 1/(n-1) · ... · 1/(n-k+1)`.
 */

const CONTEXTES_B: readonly ContexteBinomialeB[] = [
  { id: "sacLettres", texte: "Un sac contient des lettres toutes différentes. On tire les lettres une à une, sans les remettre dans le sac, en espérant reconstituer un mot précis dans l'ordre exact." },
  { id: "urneJetons", texte: "Une urne contient des jetons tous numérotés différemment. On tire les jetons un à un, sans remise, en espérant obtenir une numérotation précise dans l'ordre exact du tirage." },
  { id: "cartesOrdre", texte: "Un jeu contient des cartes toutes différentes. On tire les cartes une à une, sans les remettre, en espérant obtenir une carte précise à chaque tirage, dans un ordre donné à l'avance." },
];

const VALEURS_N: readonly number[] = [6, 7, 8, 9, 10, 11, 12];
const VALEURS_K: readonly number[] = [3, 4, 5];

/** Produit `1/n · 1/(n-1) · ... · 1/(n-k+1)`. */
export function produitFractionsDecroissantes(n: number, k: number): number {
  let produit = 1;
  for (let i = 0; i < k; i++) produit /= n - i;
  return produit;
}

/** Construction déterministe (`n`/`k` fixés) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. */
export function construireFamilleB(n: number, k: number): ExerciceBinomialeB {
  const contexte = tirerParmi(CONTEXTES_B);
  const denominateurs: number[] = [];
  for (let i = 0; i < k; i++) denominateurs.push(n - i);
  return { famille: "B", contexte, n, k, denominateurs, produitFinal: produitFractionsDecroissantes(n, k) };
}

export function genererFamilleB(): ExerciceBinomialeB {
  const n = tirerParmi(VALEURS_N);
  const kValide = VALEURS_K.filter((k) => k < n);
  const k = tirerParmi(kValide);
  return construireFamilleB(n, k);
}
