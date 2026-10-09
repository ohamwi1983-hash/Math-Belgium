import type { ExerciceGraphiqueDeriveeLogarithme, FamilleGraphiqueDeriveeLogarithme } from "../../core6e/graphiqueDeriveeLogarithme.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";

export const CATALOGUE_FAMILLES: { id: FamilleGraphiqueDeriveeLogarithme; label: string }[] = [
  { id: "A", label: "A. Dérivée de k·log_base(x)/x" },
  { id: "B", label: "B. Dérivée de k·eˣ·ln(x)" },
  { id: "C", label: "C. Dérivée de k·x·ln(x)" },
];

const CONSTRUCTEURS: Record<FamilleGraphiqueDeriveeLogarithme, () => ExerciceGraphiqueDeriveeLogarithme> = {
  A: construireA,
  B: construireB,
  C: construireC,
};

export function construireAvecFamilleId(familleId: FamilleGraphiqueDeriveeLogarithme): ExerciceGraphiqueDeriveeLogarithme {
  return CONSTRUCTEURS[familleId]();
}

/** Tirage ÉQUIPROBABLE parmi les 3 familles (spec : "1 famille parmi 3, équiprobable"). */
export function tirerFamilleEquiprobable(): FamilleGraphiqueDeriveeLogarithme {
  return CATALOGUE_FAMILLES[Math.floor(Math.random() * CATALOGUE_FAMILLES.length)].id;
}

export function genererExerciceGraphiqueDeriveeLogarithme(): ExerciceGraphiqueDeriveeLogarithme {
  return construireAvecFamilleId(tirerFamilleEquiprobable());
}
