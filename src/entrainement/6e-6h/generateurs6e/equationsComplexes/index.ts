import type { ExerciceEquationsComplexes } from "../../core6e/equationsComplexes.types";
import { construireAvecBarre, construireFamilleA, construireSansBarre } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";
import { construireFamilleE, construireFamilleEComplexe, construireFamilleEReelle } from "./familleE";
import { construireFamilleF } from "./familleF";

export { construireAvecBarre, construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireFamilleE, construireFamilleEComplexe, construireFamilleEReelle, construireFamilleF, construireSansBarre };

/**
 * Couche A (6e) — point d'entrée `6gen36` (« Équations dans ℂ »). Depuis l'audit 6e ch. 5 (point
 * 25), le tirage libre (`genererExerciceEquationsComplexes`) se limite au cœur du cours : C (second
 * degré, Δ réel négatif) et E à coefficients réels, équiprobables. A, B, D, F et E à coefficients
 * complexes sont des variantes « approfondissement », accessibles par le sélecteur (et l'export).
 */

export type IdVarianteEquationsComplexes = "A_sansBarre" | "A_avecBarre" | "B" | "C" | "D" | "E" | "E_complexe" | "F";

export const CATALOGUE_VARIANTES: { id: IdVarianteEquationsComplexes; label: string }[] = [
  { id: "A_sansBarre", label: "A — Linéaire en z (sans z̄) — approfondissement" },
  { id: "A_avecBarre", label: "A — Linéaire en z et z̄, en 2 écrans — approfondissement" },
  { id: "B", label: "B — Équation rationnelle en z — approfondissement" },
  { id: "C", label: "C — Second degré, discriminant réel négatif" },
  { id: "D", label: "D — Second degré, discriminant complexe — approfondissement" },
  { id: "E", label: "E — Bicarrée u=z², coefficients réels" },
  { id: "E_complexe", label: "E — Bicarrée u=z², coefficients complexes — approfondissement" },
  { id: "F", label: "F — Quatrième degré, racines rationnelles et division — approfondissement" },
];

export function construireAvecVarianteId(id: IdVarianteEquationsComplexes): ExerciceEquationsComplexes {
  switch (id) {
    case "A_sansBarre":
      return construireSansBarre();
    case "A_avecBarre":
      return construireAvecBarre();
    case "B":
      return construireFamilleB();
    case "C":
      return construireFamilleC();
    case "D":
      return construireFamilleD();
    case "E":
      return construireFamilleEReelle();
    case "E_complexe":
      return construireFamilleEComplexe();
    case "F":
      return construireFamilleF();
  }
}

/** Tirage libre (audit 6e ch. 5, point 25) : uniquement C (Δ réel négatif) et E à coefficients
 * réels — le cœur du cours. A, B, D, F et E complexe restent accessibles par le sélecteur
 * (« approfondissement ») et par les feuilles d'évaluation. */
export function genererExerciceEquationsComplexes(): ExerciceEquationsComplexes {
  return Math.random() < 0.5 ? construireFamilleC() : construireFamilleEReelle();
}
