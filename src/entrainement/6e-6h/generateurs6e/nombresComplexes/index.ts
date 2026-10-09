import type { ExerciceNombresComplexes, FamilleNombresComplexes } from "../../core6e/nombresComplexes.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB, construireFamilleBCarre, construireFamilleBCube, construireFamilleBProduit } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";
import { construireFamilleE } from "./familleE";
import { construireFamilleF } from "./familleF";
import { construireFamilleG } from "./familleG";

export { construireFamilleA, construireFamilleB, construireFamilleBCarre, construireFamilleBCube, construireFamilleBProduit, construireFamilleC, construireFamilleD, construireFamilleE, construireFamilleF, construireFamilleG };
export { CYCLE_I, modulo4Mathematique, puissanceDeI } from "./familleG";

/**
 * Couche A (6e) — point d'entrée `6gen34` ("Nombres complexes : opérations de base et puissances de
 * i", chapitre 7). Tirage à 2 niveaux (mirroir `generateurs6e/calculPrimitives/index.ts`, 6gen23) :
 * la FAMILLE (A à G) est tirée ÉQUIPROBABLE en premier, puis le SOUS-TYPE de la famille B (seule
 * famille à en avoir un) est tiré ÉQUIPROBABLE ensuite — jamais un tirage uniforme direct parmi les
 * 9 entrées de `CATALOGUE_VARIANTES` (biaiserait les 6 autres familles contre B, qui en a 3).
 */

export type IdVarianteNombresComplexes = "A" | "B_produit" | "B_carre" | "B_cube" | "C" | "D" | "E" | "F" | "G";

export const CATALOGUE_VARIANTES: { id: IdVarianteNombresComplexes; label: string }[] = [
  { id: "A", label: "A — Addition et soustraction" },
  { id: "B_produit", label: "B — Produit (a+bi)(c+di)" },
  { id: "B_carre", label: "B — Carré (a+bi)²" },
  { id: "B_cube", label: "B — Cube (a+bi)³, en 2 écrans" },
  { id: "C", label: "C — Division par conjugué" },
  { id: "D", label: "D — Division par i (cas particulier)" },
  { id: "E", label: "E — Combiner 2 fractions" },
  { id: "F", label: "F — Simplifier le quotient avant de mettre au carré" },
  { id: "G", label: "G — Puissances de i" },
];

export function construireAvecVarianteId(id: IdVarianteNombresComplexes): ExerciceNombresComplexes {
  switch (id) {
    case "A":
      return construireFamilleA();
    case "B_produit":
      return construireFamilleBProduit();
    case "B_carre":
      return construireFamilleBCarre();
    case "B_cube":
      return construireFamilleBCube();
    case "C":
      return construireFamilleC();
    case "D":
      return construireFamilleD();
    case "E":
      return construireFamilleE();
    case "F":
      return construireFamilleF();
    case "G":
      return construireFamilleG();
  }
}

const FAMILLES: FamilleNombresComplexes[] = ["A", "B", "C", "D", "E", "F", "G"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleNombresComplexes, () => ExerciceNombresComplexes> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
  E: construireFamilleE,
  F: construireFamilleF,
  G: construireFamilleG,
};

export function genererExerciceNombresComplexes(): ExerciceNombresComplexes {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
