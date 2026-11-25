import type { Fr } from "../ui6e/nombresCombinatoireLotH2";
import { C, fr, frAdd, frMul, frPow, frSub, frVal } from "../ui6e/nombresCombinatoireLotH2";

/**
 * Couche core — `6gen108` « Avec ou sans remise ? Choisir le modèle » (6e ch. 7, §§ 5–6, processus 3
 * TRANSFÉRER). Une population de N éléments contient K « succès » ; on en tire n. X = nombre de
 * succès obtenus.
 * - tirages AVEC remise (ou répétés à l'identique) → X suit la loi binomiale B(n ; p), p = K/N ;
 * - tirages SANS remise (ou simultanés) → X suit la loi hypergéométrique H(N ; K ; n).
 * Le MODÈLE est la réponse de l'écran 1 : un VERDICT, tiré à parts égales AVANT les nombres (jamais
 * dans `forme`). L'événement (exactement j, au moins un, au plus un) est la `forme`. Les nombres sont
 * choisis pour que les deux modèles donnent des probabilités qui diffèrent d'au moins 0,001 (le message
 * « mauvais modèle » de l'écran 3 se déclenche à coup sûr, et l'arrondi au dix-millième les sépare).
 */

export type ContexteASR = "urne" | "cartes" | "lot" | "classe";
export type ModeleASR = "binomiale" | "hypergeometrique";
export type EvenementASR = "exactement" | "auMoinsUn" | "auPlusUn";
export type PhaseASR = "modele" | "parametres" | "proba";

export const PHASES_ASR: PhaseASR[] = ["modele", "parametres", "proba"];
export const EVENEMENTS_ASR: EvenementASR[] = ["exactement", "auMoinsUn", "auPlusUn"];

export interface ExerciceASR {
  variante: ContexteASR;
  modele: ModeleASR;
  evenement: EvenementASR;
  N: number;
  K: number;
  n: number;
  /** Nombre exact de succès (« exactement »), sinon 0. */
  j: number;
  /** Cartes : 0 = as (K = 4), 1 = cœurs (K = 8) ; autres contextes : 0. */
  sorte: number;
  /** Ordre d'affichage des deux modèles. */
  options: ModeleASR[];
}

/** P(X = i) dans le modèle `m`. */
export function loi(e: ExerciceASR, m: ModeleASR, i: number): Fr {
  if (m === "binomiale") {
    const p = fr(e.K, e.N);
    return frMul(fr(C(e.n, i)), frMul(frPow(p, i), frPow(frSub(fr(1), p), e.n - i)));
  }
  return fr(C(e.K, i) * C(e.N - e.K, e.n - i), C(e.N, e.n));
}

/** Probabilité de l'événement dans le modèle `m`. */
export function probaEvenement(e: ExerciceASR, m: ModeleASR): Fr {
  if (e.evenement === "exactement") return loi(e, m, e.j);
  if (e.evenement === "auMoinsUn") return frSub(fr(1), loi(e, m, 0));
  return frAdd(loi(e, m, 0), loi(e, m, 1));
}

export const probaJuste = (e: ExerciceASR): Fr => probaEvenement(e, e.modele);
export const autreModele = (m: ModeleASR): ModeleASR => (m === "binomiale" ? "hypergeometrique" : "binomiale");
export const ecartModeles = (e: ExerciceASR): number => Math.abs(frVal(probaEvenement(e, "binomiale")) - frVal(probaEvenement(e, "hypergeometrique")));

/** Valeurs des paramètres de l'écran 2 (binomiale : n, p ; hypergéométrique : N, K, n). */
export function parametres(e: ExerciceASR): Fr[] {
  return e.modele === "binomiale" ? [fr(e.n), fr(e.K, e.N)] : [fr(e.N), fr(e.K), fr(e.n)];
}
