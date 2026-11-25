import type { ExerciceChemins, VarianteChemins } from "../../core6e/cheminsQuadrillage";
import { entier, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen106` « Chemins dans un quadrillage ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). Quadrillage de 3 à 7 carreaux de large et 2 à 5 de haut (au plus
 * C₁₂⁵ = 792 chemins) ; P intérieur, jamais au centre exact d'une symétrie qui rendrait A → P et
 * P → B identiques à chaque fois.
 */

export const CATALOGUE_VARIANTES: { id: VarianteChemins; label: string }[] = [
  { id: "total", label: "Chemins de A à B" },
  { id: "passage", label: "Chemins qui passent par un point" },
  { id: "eviter", label: "Chemins qui évitent un point" },
];

export function construire(variante: VarianteChemins): ExerciceChemins {
  const ctx: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
  for (;;) {
    const m = entier(3, 7);
    const n = entier(2, 5);
    if (m + n > 12) continue;
    if (variante === "total") return { variante, m, n, px: 0, py: 0, ctx };
    const px = entier(1, m - 1);
    const py = entier(1, n - 1);
    // Évite P exactement au centre (A → P et P → B toujours égaux).
    if (2 * px === m && 2 * py === n && Math.random() < 0.7) continue;
    return { variante, m, n, px, py, ctx };
  }
}

export function construireAvecVariante(id: string): ExerciceChemins {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceChemins(): ExerciceChemins {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
