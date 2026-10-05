import type { ClassificationArithmetique, ExerciceConvergenceArithmetique } from "../../core5e/convergenceSuites.types";

// "Cible d'abord" : la classification est choisie EN PREMIER (uniforme, garantit les 3 cas à
// fréquence comparable — jamais un tirage aléatoire de r qui laisserait r=0 exact quasi inatteignable),
// r DÉRIVÉ pour y correspondre exactement.
const CLASSIFICATIONS: ClassificationArithmetique[] = ["convergeVersU1", "divergePlusInfini", "divergeMoinsInfini"];

function entierAleatoire(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function entierNonNul(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = entierAleatoire(min, max);
  return v;
}
function elementAleatoire<T>(tab: readonly T[]): T {
  return tab[Math.floor(Math.random() * tab.length)];
}

export function genererExerciceConvergenceArithmetique(): ExerciceConvergenceArithmetique {
  const classification = elementAleatoire(CLASSIFICATIONS);
  const u1 = entierAleatoire(-15, 15);
  const r = classification === "convergeVersU1" ? 0 : classification === "divergePlusInfini" ? entierNonNul(1, 9) : -entierNonNul(1, 9);
  return { variante: "arithmetique", u1, r, classification };
}
