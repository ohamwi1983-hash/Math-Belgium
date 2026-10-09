import type { ExerciceEtudeFonctionLogarithme, FamilleEtudeFonctionLogarithme } from "../../core6e/etudeFonctionLogarithme.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";

/** Catalogue de variantes (convention permanente, voir CLAUDE.md) — 5 familles, tirage
 * ÉQUIPROBABLE (spec explicite : "Tirage aléatoire d'1 famille parmi 5 (A à E, équiprobable)"). */
export const CATALOGUE_FAMILLES: { id: FamilleEtudeFonctionLogarithme; label: string }[] = [
  { id: "A", label: "A. x^(ax), dérivation logarithmique" },
  { id: "B", label: "B. x^(k/x), dérivation logarithmique" },
  { id: "C", label: "C. ln|k²-x²|, domaine élargi par |.|" },
  { id: "D", label: "D. x+c·e^(-x), asymptote oblique" },
  { id: "E", label: "E. Oscillation amortie/amplifiée (2 écrans)" },
];

const CONSTRUCTEURS: Record<FamilleEtudeFonctionLogarithme, () => ExerciceEtudeFonctionLogarithme> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
  E: construireE,
};

export function construireAvecFamilleId(familleId: FamilleEtudeFonctionLogarithme): ExerciceEtudeFonctionLogarithme {
  return CONSTRUCTEURS[familleId]();
}

/** Tirage ÉQUIPROBABLE parmi les 5 familles. */
export function tirerFamilleEquiprobable(): FamilleEtudeFonctionLogarithme {
  return CATALOGUE_FAMILLES[Math.floor(Math.random() * CATALOGUE_FAMILLES.length)].id;
}

export function genererExerciceEtudeFonctionLogarithme(): ExerciceEtudeFonctionLogarithme {
  return construireAvecFamilleId(tirerFamilleEquiprobable());
}
