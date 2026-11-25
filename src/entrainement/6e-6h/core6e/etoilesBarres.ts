import { comb } from "../ui6e/nombresCombinatoireLotH";

/**
 * Couche A — modèle de `6gen104` « Étoiles et barres » (6e ch. 7, § 1). Répartir p objets
 * IDENTIQUES dans n cases DISTINCTES (parfums, enfants, inconnues) : Γₙᵖ = C₍ₙ₊ₚ₋₁₎ᵖ = C₍ₙ₊ₚ₋₁₎ⁿ⁻¹ ;
 * « au moins un par case » : on en place d'abord un dans chaque case, il reste p − n objets libres.
 */

export type Variante104 = "glaces" | "bonbons" | "equation" | "auMoinsUn";
export type Contexte104 = "glace" | "viennoiseries" | "des" | "bonbons" | "votes" | "billes" | "equation";
export type Phase104 = "np" | "codage" | "calcul";

export interface Exercice104 {
  variante: Variante104;
  contexte: Contexte104;
  /** Nombre de cases (types, enfants, inconnues). */
  n: number;
  /** Nombre d'objets de l'énoncé (avant d'en placer un par case pour « au moins un »). */
  p: number;
}

export const PHASES_104: Phase104[] = ["np", "codage", "calcul"];

/** Objets répartis LIBREMENT (p, ou p − n quand chaque case en reçoit au moins un). */
export const pLibre = (e: Exercice104) => (e.variante === "auMoinsUn" ? e.p - e.n : e.p);
/** Nombre de symboles (étoiles + barres). */
export const symboles = (e: Exercice104) => pLibre(e) + e.n - 1;
export const barres = (e: Exercice104) => e.n - 1;
export const reponse104 = (e: Exercice104) => comb(symboles(e), barres(e));
