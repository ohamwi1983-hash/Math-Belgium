import type { ParametresSinusoideBase } from "./parametresSinusoide.types";

/** 5gen9 tire A, T, φ, b exactement comme 5gen8 (`ParametresSinusoideBase`) — aucun champ
 * supplémentaire nécessaire, la seule différence est l'ABSENCE de `forme`/`B`/`C` (5gen9 ne montre
 * jamais de formule, uniquement un graphique). */
export type ExerciceParametresSinusoideGraphique = ParametresSinusoideBase;
