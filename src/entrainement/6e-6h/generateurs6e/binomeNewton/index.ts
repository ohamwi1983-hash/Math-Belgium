import type { ExerciceBinomeNewton, FamilleBinomeNewton } from "../../core6e/binomeNewton.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB, construirePuissance, construireRang } from "./familleB";
import { construireFamilleC } from "./familleC";

export { construireFamilleA, construireFamilleB, construireFamilleC, construirePuissance, construireRang };

/**
 * Couche A (6e) — point d'entrée `6gen45` ("Binôme de Newton"), chapitre "Analyse combinatoire".
 * Tirage ÉQUIPROBABLE de la famille (A/B/C) — famille B choisit ensuite son sous-type
 * (rang/puissance) ÉQUIPROBABLE en interne (`construireFamilleB`), mirroir `denombrementFondamental/
 * index.ts` (6gen43) à 2 niveaux de tirage.
 */

export type IdVarianteBinomeNewton = "A" | "B_rang" | "B_puissance" | "C";

export const CATALOGUE_VARIANTES: { id: IdVarianteBinomeNewton; label: string }[] = [
  { id: "A", label: "A — Développement complet de (ax+b)ⁿ" },
  { id: "B_rang", label: "B — Terme de rang k donné" },
  { id: "B_puissance", label: "B — Coefficient du terme en xᵖ" },
  { id: "C", label: "C — Approximation décimale (1+ε)ⁿ" },
];

export function construireAvecVarianteId(id: IdVarianteBinomeNewton): ExerciceBinomeNewton {
  switch (id) {
    case "A":
      return construireFamilleA();
    case "B_rang":
      return construireRang();
    case "B_puissance":
      return construirePuissance();
    case "C":
      return construireFamilleC();
  }
}

const FAMILLES: FamilleBinomeNewton[] = ["A", "B", "C"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleBinomeNewton, () => ExerciceBinomeNewton> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
};

export function genererExerciceBinomeNewton(): ExerciceBinomeNewton {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
