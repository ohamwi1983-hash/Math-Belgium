import type { ExerciceEtudeFonctionExponentielle, FamilleEtudeFonctionExponentielle } from "../../core6e/etudeFonctionExponentielle.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";

/** Catalogue de variantes (convention permanente, voir CLAUDE.md) — 4 familles, tirage
 * ÉQUIPROBABLE (spec explicite : "Tirage aléatoire d'1 famille parmi 4 (A à D, équiprobable)"). */
export const CATALOGUE_FAMILLES: { id: FamilleEtudeFonctionExponentielle; label: string }[] = [
  { id: "A", label: "A. Exponentielle simple, e^(mx+n)" },
  { id: "B", label: "B. Point exclu, asymptote asymétrique" },
  { id: "C", label: "C. Asymptote oblique" },
  { id: "D", label: "D. Produit a·x·eˣ (réutilise 6gen8)" },
];

const CONSTRUCTEURS: Record<FamilleEtudeFonctionExponentielle, () => ExerciceEtudeFonctionExponentielle> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
};

export function construireAvecFamilleId(familleId: FamilleEtudeFonctionExponentielle): ExerciceEtudeFonctionExponentielle {
  return CONSTRUCTEURS[familleId]();
}

/** Tirage ÉQUIPROBABLE parmi les 4 familles. */
export function tirerFamilleEquiprobable(): FamilleEtudeFonctionExponentielle {
  return CATALOGUE_FAMILLES[Math.floor(Math.random() * CATALOGUE_FAMILLES.length)].id;
}

export function genererExerciceEtudeFonctionExponentielle(): ExerciceEtudeFonctionExponentielle {
  return construireAvecFamilleId(tirerFamilleEquiprobable());
}
