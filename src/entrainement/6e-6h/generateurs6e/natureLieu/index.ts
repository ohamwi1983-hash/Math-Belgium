import type { Exercice127, Famille127 } from "../../core6e/natureLieu";
import { tirer127 } from "../../core6e/natureLieu";

/**
 * Couche A — générateur de `6gen127` « Quelle est la nature du lieu ? ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). Tirage libre : la nature (verdict) à parts égales parmi les onze, puis une
 * famille qui la produit. Variante = famille de conditions (son nom ne dit pas la nature ; la nature y
 * est tirée à parts égales parmi celles que la famille produit).
 */

export const CATALOGUE_127: { id: Famille127; label: string }[] = [
  { id: "deuxPoints", label: "Distances à deux points (PA² + PB², PA² − PB², PA/PB)" },
  { id: "valeursAbsolues", label: "Valeurs absolues (somme, différence, une seule)" },
  { id: "distancesDroites", label: "Distances à des droites (parallèles, sécantes, somme)" },
  { id: "carre", label: "Distances aux côtés d'un carré (somme, somme des carrés)" },
];

export function construireAvecVariante127(id: string): Exercice127 {
  const v = CATALOGUE_127.find((x) => x.id === id);
  return tirer127(v ? v.id : undefined);
}

export function genererExercice127(): Exercice127 {
  return tirer127();
}
