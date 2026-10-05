import type { ExerciceGraphiqueDeriveeExponentielle, FamilleGraphiqueDeriveeExponentielle } from "../../core6e/graphiquesDeriveeExponentielles.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";

export const CATALOGUE_FAMILLES: { id: FamilleGraphiqueDeriveeExponentielle; label: string }[] = [
  { id: "A", label: "A. Dérivée d'un produit simple" },
  { id: "B", label: "B. Dérivée d'un quotient logistique" },
  { id: "C", label: "C. Dérivée d'une somme symétrique" },
  { id: "D", label: "D. Dérivée d'une réciproque, point exclu" },
];

const CONSTRUCTEURS: Record<FamilleGraphiqueDeriveeExponentielle, () => ExerciceGraphiqueDeriveeExponentielle> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
};

export function construireAvecFamilleId(familleId: FamilleGraphiqueDeriveeExponentielle): ExerciceGraphiqueDeriveeExponentielle {
  return CONSTRUCTEURS[familleId]();
}

/** Tirage ÉQUIPROBABLE parmi les 4 familles (spec : "1 famille parmi 4, équiprobable"). */
export function tirerFamilleEquiprobable(): FamilleGraphiqueDeriveeExponentielle {
  return CATALOGUE_FAMILLES[Math.floor(Math.random() * CATALOGUE_FAMILLES.length)].id;
}

export function genererExerciceGraphiqueDeriveeExponentielle(): ExerciceGraphiqueDeriveeExponentielle {
  return construireAvecFamilleId(tirerFamilleEquiprobable());
}
