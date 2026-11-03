import type { ExerciceEtudeFonctionLogarithme, FamilleEtudeFonctionLogarithme } from "../../core6e/etudeFonctionLogarithme.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";

/** Catalogue de variantes (convention permanente, voir CLAUDE.md) — 5 familles logarithmiques,
 * tirage ÉQUIPROBABLE. */
export const CATALOGUE_FAMILLES: { id: FamilleEtudeFonctionLogarithme; label: string }[] = [
  { id: "A", label: "A. k(ln x + c)/x" },
  { id: "B", label: "B. (bx)^(ax) + c, dérivation logarithmique" },
  { id: "C", label: "C. m·ln|x² + βx + γ|, domaine élargi par |.|" },
  { id: "D", label: "D. m·ln(x² + βx + γ), trinôme toujours positif" },
  { id: "E", label: "E. m(ln x + c/x)" },
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

export function tirerFamilleEquiprobable(): FamilleEtudeFonctionLogarithme {
  return CATALOGUE_FAMILLES[Math.floor(Math.random() * CATALOGUE_FAMILLES.length)].id;
}

export function genererExerciceEtudeFonctionLogarithme(): ExerciceEtudeFonctionLogarithme {
  return construireAvecFamilleId(tirerFamilleEquiprobable());
}
