import type { ExerciceDomaineDeriveeLogarithme, FamilleDomaineDeriveeLogarithme } from "../../core6e/domaineDeriveeLogarithme.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";
import { construireF } from "./familles/F";
import { construireG } from "./familles/G";

export const CATALOGUE_FAMILLES: { id: FamilleDomaineDeriveeLogarithme; label: string }[] = [
  { id: "A", label: "A — Application directe" },
  { id: "B", label: "B — Domaine via racine/quadratique" },
  { id: "C", label: "C — Produit avec terme logarithmique" },
  { id: "D", label: "D — Quotient avec terme logarithmique" },
  { id: "E", label: "E — Simplifier avant de dériver" },
  { id: "F", label: "F — Synthèse transversale" },
  { id: "G", label: "G — Dérivation logarithmique implicite" },
];

const CONSTRUCTEURS: Record<FamilleDomaineDeriveeLogarithme, () => ExerciceDomaineDeriveeLogarithme> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
  E: construireE,
  F: construireF,
  G: construireG,
};

export function construireAvecFamilleId(familleId: FamilleDomaineDeriveeLogarithme): ExerciceDomaineDeriveeLogarithme {
  return CONSTRUCTEURS[familleId]();
}

/** Tirage ÉQUIPROBABLE parmi les 7 familles (spec : "Tirage aléatoire d'1 famille parmi 7 (A à G,
 * équiprobable)"). */
export function tirerFamilleEquiprobable(): FamilleDomaineDeriveeLogarithme {
  return CATALOGUE_FAMILLES[Math.floor(Math.random() * CATALOGUE_FAMILLES.length)].id;
}

export function genererExerciceDomaineDeriveeLogarithme(): ExerciceDomaineDeriveeLogarithme {
  return construireAvecFamilleId(tirerFamilleEquiprobable());
}
