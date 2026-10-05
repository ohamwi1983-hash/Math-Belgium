import type { ExerciceGraphiquesCyclometriques, FamilleGraphiquesCyclometriques } from "../../core6e/graphiquesCyclometriques.types";
import { tirerParmi } from "./aleatoire";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";
import { construireF } from "./familles/F";

export const CATALOGUE_FAMILLES: { id: FamilleGraphiquesCyclometriques; label: string }[] = [
  { id: "A", label: "A. arcsin/arccos, argument linéaire" },
  { id: "B", label: "B. arctan, argument linéaire" },
  { id: "C", label: "C. Argument en x² (fonction paire)" },
  { id: "D", label: "D. arctan(k/(x-p)), point exclu isolé" },
  { id: "E", label: "E. Racine d'une expression affine en arcfonction(x)" },
  { id: "F", label: "F. Carré d'une arcfonction affine, décalé" },
];

export function construireAvecFamilleId(id: FamilleGraphiquesCyclometriques): ExerciceGraphiquesCyclometriques {
  switch (id) {
    case "A":
      return construireA();
    case "B":
      return construireB();
    case "C":
      return construireC();
    case "D":
      return construireD();
    case "E":
      return construireE();
    case "F":
      return construireF();
  }
}

export function genererExerciceGraphiquesCyclometriques(): ExerciceGraphiquesCyclometriques {
  const id = tirerParmi(CATALOGUE_FAMILLES.map((f) => f.id));
  return construireAvecFamilleId(id);
}
