import type { ExerciceVolumesRevolution, FamilleVolumesRevolution } from "../../core6e/volumesRevolution.types";
import { construireFamilleVolumeA, construireFamilleVolumeA_Exponentielle, construireFamilleVolumeA_Polynomiale, construireFamilleVolumeA_Trigonometrique } from "./familleA";
import { construireFamilleVolumeB } from "./familleB";
import { construireFamilleVolumeC } from "./familleC";
import { construireFamilleVolumeD } from "./familleD";

/**
 * Couche A (6e) — point d'entrée `6gen27` ("Volumes de révolution", chapitre 4). Tirage
 * ÉQUIPROBABLE de la famille (A à D) — voir en-tête de chaque `familleX.ts` pour la construction
 * détaillée et le contrat de réutilisation de 6gen23/6gen26.
 */

export { construireFamilleVolumeA, construireFamilleVolumeA_Exponentielle, construireFamilleVolumeA_Polynomiale, construireFamilleVolumeA_Trigonometrique, construireFamilleVolumeB, construireFamilleVolumeC, construireFamilleVolumeD };

export type IdVarianteVolumesRevolution = "A_polynomiale" | "A_exponentielle" | "A_trigonometrique" | "B" | "C" | "D";

/** Catalogue de variantes `{id,label}` + `construireAvecVarianteId` — convention permanente
 * (CLAUDE.md). Les familles B/C/D n'ont qu'un seul constructeur (pas de sous-type interne). */
export const CATALOGUE_VARIANTES: { id: IdVarianteVolumesRevolution; label: string }[] = [
  { id: "A_polynomiale", label: "A — Volume par rotation, polynomiale" },
  { id: "A_exponentielle", label: "A — Volume par rotation, exponentielle" },
  { id: "A_trigonometrique", label: "A — Volume par rotation, trigonométrique (cos)" },
  { id: "B", label: "B — Volume par rotation, bornes à trouver" },
  { id: "C", label: "C — Volume entre une courbe et une droite" },
  { id: "D", label: "D — Comparaison à un cylindre englobant" },
];

export function construireAvecVarianteId(id: IdVarianteVolumesRevolution): ExerciceVolumesRevolution {
  switch (id) {
    case "A_polynomiale":
      return construireFamilleVolumeA_Polynomiale();
    case "A_exponentielle":
      return construireFamilleVolumeA_Exponentielle();
    case "A_trigonometrique":
      return construireFamilleVolumeA_Trigonometrique();
    case "B":
      return construireFamilleVolumeB();
    case "C":
      return construireFamilleVolumeC();
    case "D":
      return construireFamilleVolumeD();
  }
}

const FAMILLES: FamilleVolumesRevolution[] = ["A", "B", "C", "D"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleVolumesRevolution, () => ExerciceVolumesRevolution> = {
  A: construireFamilleVolumeA,
  B: construireFamilleVolumeB,
  C: construireFamilleVolumeC,
  D: construireFamilleVolumeD,
};

/** Tirage à 1 niveau pour la famille (équiprobable), 2 niveaux pour A (`construireFamilleVolumeA`
 * tire son propre type de courbe équiprobable) — jamais un tirage uniforme direct parmi les 6
 * entrées de `CATALOGUE_VARIANTES` (biaiserait A, qui a 3 sous-types, contre B/C/D qui n'en ont
 * aucun). */
export function genererExerciceVolumesRevolution(): ExerciceVolumesRevolution {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
