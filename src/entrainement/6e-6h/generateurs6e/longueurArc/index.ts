import type { ExerciceLongueurArc, FamilleLongueurArc } from "../../core6e/longueurArc.types";
import { construireFamilleLongueurArcA } from "./familleA";
import { construireFamilleLongueurArcB } from "./familleB";
import { construireFamilleLongueurArcC } from "./familleC";

/**
 * Couche A (6e) — point d'entrée `6gen28` ("Longueur d'un arc de courbe", chapitre 4). Tirage
 * ÉQUIPROBABLE de la famille (A à C) — pas de sous-type à l'intérieur d'une famille (contrairement
 * à 6gen26), donc `CATALOGUE_VARIANTES` a exactement 3 entrées et le tirage à 1 seul niveau.
 */

export { construireFamilleLongueurArcA, construireFamilleLongueurArcB, construireFamilleLongueurArcC };

export type IdVarianteLongueurArc = "A" | "B" | "C";

export const CATALOGUE_VARIANTES: { id: IdVarianteLongueurArc; label: string }[] = [
  { id: "A", label: "A — Racine parfaite par construction" },
  { id: "B", label: "B — Substitution t=√(x²+k²), bornes construites" },
  { id: "C", label: "C — Cas simple, substitution directe" },
];

export function construireAvecVarianteId(id: IdVarianteLongueurArc): ExerciceLongueurArc {
  switch (id) {
    case "A":
      return construireFamilleLongueurArcA();
    case "B":
      return construireFamilleLongueurArcB();
    case "C":
      return construireFamilleLongueurArcC();
  }
}

const FAMILLES: FamilleLongueurArc[] = ["A", "B", "C"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleLongueurArc, () => ExerciceLongueurArc> = {
  A: construireFamilleLongueurArcA,
  B: construireFamilleLongueurArcB,
  C: construireFamilleLongueurArcC,
};

export function genererExerciceLongueurArc(): ExerciceLongueurArc {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
