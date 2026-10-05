import type { Morceau } from "../core/inequation.types";
import type { EtatMorceauFraction } from "./morceauFraction";
import { construireMorceauFraction, etatMorceauFractionInitial } from "./morceauFraction";

/** Variante fraction-compatible de `listeMorceaux.ts` (douzième exercice) — même mécanisme
 * extensible (ajout/retrait libres, jamais moins d'une ligne), sur `EtatMorceauFraction` plutôt que
 * `EtatMorceau` (bornes fraction-compatibles, voir `morceauFraction.ts`). */
export type EtatListeMorceauxFraction = EtatMorceauFraction[];

export function etatListeFractionInitiale(): EtatListeMorceauxFraction {
  return [etatMorceauFractionInitial()];
}

export function ajouterMorceauFraction(etat: EtatListeMorceauxFraction): EtatListeMorceauxFraction {
  return [...etat, etatMorceauFractionInitial()];
}

export function retirerMorceauFraction(etat: EtatListeMorceauxFraction, index: number): EtatListeMorceauxFraction {
  if (etat.length <= 1) return etat;
  return etat.filter((_, i) => i !== index);
}

export function remplacerMorceauFraction(
  etat: EtatListeMorceauxFraction,
  index: number,
  nouveauMorceau: EtatMorceauFraction,
): EtatListeMorceauxFraction {
  return etat.map((m, i) => (i === index ? nouveauMorceau : m));
}

export function construireListeFraction(etat: EtatListeMorceauxFraction): Morceau[] | null {
  const morceaux = etat.map(construireMorceauFraction);
  if (morceaux.some((m) => m === null)) return null;
  return morceaux as Morceau[];
}
