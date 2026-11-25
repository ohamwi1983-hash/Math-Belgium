import type { Exercice112, Variante112 } from "../../core6e/fonctionRepartition";
import { tirer112 } from "../../core6e/fonctionRepartition";

/**
 * Couche A — générateur de `6gen112` « Fonction de répartition ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). Deux variantes : `escalier` (loi discrète) et `continue` (laquelle de deux
 * fonctions est une fonction de répartition ? verdict tiré à parts égales AVANT les nombres).
 */

export const CATALOGUE_112: { id: Variante112; label: string }[] = [
  { id: "escalier", label: "Escalier : F d'une loi discrète, intervalle et complément" },
  { id: "continue", label: "Continue : laquelle est une fonction de répartition ? P, puis f = F′" },
];

export function construireAvecVariante112(id: string): Exercice112 {
  const v = CATALOGUE_112.find((x) => x.id === id);
  return tirer112(v ? v.id : Math.random() < 0.5 ? "escalier" : "continue");
}

export function genererExercice112(): Exercice112 {
  return tirer112(Math.random() < 0.5 ? "escalier" : "continue");
}
