import type { ExerciceDomaineDeriveeExponentielle, FamilleDomaineDeriveeExponentielle } from "../../core6e/domaineDeriveeExponentielles.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";
import { construireF } from "./familles/F";

export const CATALOGUE_FAMILLES: { id: FamilleDomaineDeriveeExponentielle; label: string }[] = [
  { id: "A", label: "A — Application directe" },
  { id: "B", label: "B — Exposant à domaine restreint" },
  { id: "C", label: "C — Produit avec terme exponentiel" },
  { id: "D", label: "D — Quotient avec terme exponentiel" },
  { id: "E", label: "E — Simplifier avant de dériver" },
  { id: "F", label: "F — Composition triple (trig/cyclométrique)" },
];

const CONSTRUCTEURS: Record<FamilleDomaineDeriveeExponentielle, () => ExerciceDomaineDeriveeExponentielle> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
  E: construireE,
  F: construireF,
};

export function construireAvecFamilleId(familleId: FamilleDomaineDeriveeExponentielle): ExerciceDomaineDeriveeExponentielle {
  return CONSTRUCTEURS[familleId]();
}

/** Tirage ÉQUIPROBABLE parmi les 6 familles (spec : aucune pondération demandée pour ce
 * générateur — contrairement à `6gen6`, dont la famille G, instance unique, est délibérément plus
 * rare). */
export function tirerFamilleEquiprobable(): FamilleDomaineDeriveeExponentielle {
  return CATALOGUE_FAMILLES[Math.floor(Math.random() * CATALOGUE_FAMILLES.length)].id;
}

export function genererExerciceDomaineDeriveeExponentielle(): ExerciceDomaineDeriveeExponentielle {
  return construireAvecFamilleId(tirerFamilleEquiprobable());
}
