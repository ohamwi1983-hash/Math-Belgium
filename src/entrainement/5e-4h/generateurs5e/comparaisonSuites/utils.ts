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

/** Résout la temporalité de l'exercice à partir du contexte tiré — `periode==="an"` : ancrage
 * calendaire (année de départ + décalage), `periode==="mois"` : simple décompte de mois écoulés,
 * sans année. Partagé par les 3 branches (avant cette évolution, seule `stockDemande` utilisait le
 * mode "mois", câblé en dur par branche plutôt que par contexte). */
export function resoudrePeriode(contexte: ContexteComparaisonSuites, nSeuil: number): { anneeDepart: number | null; traductionValeur: number; uniteContexte: string } {
  if (contexte.periode === "an") {
    const anneeDepart = entierAleatoire(2015, 2023);
    return { anneeDepart, traductionValeur: anneeDepart + (nSeuil - 1), uniteContexte: "année" };
  }
  return { anneeDepart: null, traductionValeur: nSeuil, uniteContexte: "mois" };
}
