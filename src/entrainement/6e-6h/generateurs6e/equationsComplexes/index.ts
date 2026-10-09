import type { ExerciceEquationsComplexes, FamilleEquationsComplexes } from "../../core6e/equationsComplexes.types";
import { construireAvecBarre, construireFamilleA, construireSansBarre } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";
import { construireFamilleE } from "./familleE";
import { construireFamilleF } from "./familleF";

export { construireAvecBarre, construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireFamilleE, construireFamilleF, construireSansBarre };

/**
 * Couche A (6e) — point d'entrée `6gen36` ("Équations dans ℂ", chapitre 7). Tirage à 2 niveaux
 * (mirroir `generateurs6e/nombresComplexes/index.ts`, 6gen34) : la FAMILLE (A à F) est tirée
 * ÉQUIPROBABLE en premier (`genererExerciceEquationsComplexes`), puis le SOUS-TYPE de la famille A
 * (seule famille à en avoir un) est tiré ÉQUIPROBABLE ensuite (`construireFamilleA`) — jamais un
 * tirage uniforme direct parmi les 7 entrées de `CATALOGUE_VARIANTES` (biaiserait les 5 autres
 * familles contre A, qui en a 2).
 */

export type IdVarianteEquationsComplexes = "A_sansBarre" | "A_avecBarre" | "B" | "C" | "D" | "E" | "F";

export const CATALOGUE_VARIANTES: { id: IdVarianteEquationsComplexes; label: string }[] = [
  { id: "A_sansBarre", label: "A — Linéaire en z (sans z̄)" },
  { id: "A_avecBarre", label: "A — Linéaire en z et z̄, en 2 écrans" },
  { id: "B", label: "B — Équation rationnelle en z" },
  { id: "C", label: "C — Quadratique, discriminant réel négatif" },
  { id: "D", label: "D — Quadratique, discriminant complexe" },
  { id: "E", label: "E — Quartique biquadratique u=z²" },
  { id: "F", label: "F — Quartique, racines rationnelles et division" },
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
      return construireFamilleE();
    case "F":
      return construireFamilleF();
  }
}

const FAMILLES: FamilleEquationsComplexes[] = ["A", "B", "C", "D", "E", "F"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleEquationsComplexes, () => ExerciceEquationsComplexes> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
  E: construireFamilleE,
  F: construireFamilleF,
};

export function genererExerciceEquationsComplexes(): ExerciceEquationsComplexes {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
