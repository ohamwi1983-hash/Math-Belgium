import type { ExerciceDeriveesCyclometriques, FamilleDeriveesCyclometriques } from "../../core6e/deriveesCyclometriques.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";
import { construireF } from "./familles/F";
import { construireG } from "./familles/G";

/** Catalogue de variantes `{id,label}` + `construireAvecFamilleId` — convention permanente. */
export const CATALOGUE_FAMILLES: { id: FamilleDeriveesCyclometriques; label: string }[] = [
  { id: "A", label: "Application directe" },
  { id: "B", label: "Règle du produit" },
  { id: "C", label: "Règle du quotient, sans identité" },
  { id: "D", label: "Quotient avec identité arcsin+arccos=π/2" },
  { id: "E", label: "Composition imbriquée, sans identité" },
  { id: "F", label: "Composition imbriquée + identité trigonométrique" },
  { id: "G", label: "Réciproque vs argument-fraction" },
];

const CONSTRUCTEURS: Record<FamilleDeriveesCyclometriques, () => ExerciceDeriveesCyclometriques> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
  E: construireE,
  F: construireF,
  G: construireG,
};

export function construireAvecFamilleId(familleId: FamilleDeriveesCyclometriques): ExerciceDeriveesCyclometriques {
  return CONSTRUCTEURS[familleId]();
}

/** Tirage ÉQUIPROBABLE parmi les 7 familles (spec explicite). */
export function genererExerciceDeriveesCyclometriques(): ExerciceDeriveesCyclometriques {
  return construireAvecFamilleId(CATALOGUE_FAMILLES[Math.floor(Math.random() * CATALOGUE_FAMILLES.length)].id);
}
