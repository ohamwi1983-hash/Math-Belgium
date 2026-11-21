import { lireNombre } from "./verificationTransfertSecondDegre";

/**
 * Lecture d'un vecteur saisi en colonne (gen129, champ `vecteurColonne` de la coquille commune) :
 * la saisie est « x\ny » (une case par composante). Chaque composante est un nombre exact : entier,
 * fraction (« 2/3 »), décimal à virgule, « − – — » lus comme « - ». `null` = illisible (case vide,
 * lettre…), jamais une tentative comptée.
 */

export interface Composantes {
  x: number;
  y: number;
}

export function lireVecteurColonne(saisie: string): Composantes | null {
  const morceaux = saisie.split("\n");
  if (morceaux.length !== 2) return null;
  const x = lireNombre(morceaux[0]!);
  const y = lireNombre(morceaux[1]!);
  return x === null || y === null ? null : { x, y };
}

export const estNul = (u: Composantes) => Math.abs(u.x) < 1e-12 && Math.abs(u.y) < 1e-12;

/** u et v colinéaires (critère de colinéarité x_u·y_v − y_u·x_v = 0). */
export function colineaires(u: Composantes, v: Composantes): boolean {
  return Math.abs(u.x * v.y - u.y * v.x) < 1e-9 * Math.max(1, Math.abs(u.x * v.y), Math.abs(u.y * v.x));
}
