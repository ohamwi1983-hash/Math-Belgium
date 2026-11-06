import type { ContexteComparaisonSuites, FamilleComparaisonSuites } from "../../core5e/comparaisonSuites.types";
import { CONTEXTES_COMPARAISON_SUITES } from "./contextes";

export function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function tirerElement<T>(tableau: T[]): T {
  return tableau[Math.floor(Math.random() * tableau.length)];
}

export function capitaliser(texte: string): string {
  return texte.length === 0 ? texte : texte[0].toUpperCase() + texte.slice(1);
}

/** Tire un contexte parmi ceux autorisés pour la branche donnée (`branchesAutorisees` non défini =
 * autorisé partout) — jamais un contexte fixe par branche. */
export function tirerContexte(famille: FamilleComparaisonSuites): ContexteComparaisonSuites {
  const eligibles = CONTEXTES_COMPARAISON_SUITES.filter((c) => !c.branchesAutorisees || c.branchesAutorisees.includes(famille));
  return tirerElement(eligibles);
}

/** Résout la temporalité de l'exercice à partir du contexte tiré — `periode==="an"` : le rang n = 1
 * est l'année de départ, la traduction est `année = départ + (n − 1)` ; `periode==="mois"` : le rang n
 * est le n-ième mois (« au cours du combientième mois »), la traduction est le numéro du mois, n
 * lui-même (énoncé formulé en conséquence, `ui5e/formatComparaisonSuites.ts`). */
export function resoudrePeriode(contexte: ContexteComparaisonSuites, nSeuil: number): { anneeDepart: number | null; traductionValeur: number; uniteContexte: string } {
  if (contexte.periode === "an") {
    const anneeDepart = entierAleatoire(2015, 2023);
    return { anneeDepart, traductionValeur: anneeDepart + (nSeuil - 1), uniteContexte: "année" };
  }
  return { anneeDepart: null, traductionValeur: nSeuil, uniteContexte: "mois" };
}
