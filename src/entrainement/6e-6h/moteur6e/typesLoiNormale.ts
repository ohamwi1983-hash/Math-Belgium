import type { ExerciceLoiNormale } from "../core6e/loiNormale.types";

/**
 * Écrans de `6gen51` (socle commun `sessionCombinatoire.ts`) — un choix fermé est toujours SEUL sur son
 * écran (audit, G17 : le champ voisin recouvrait « Symétrie nécessaire », l'exercice ne pouvait pas
 * être terminé).
 * - A : écriture avec Φ (choix), probabilité.
 * - B : z, écriture avec Φ (choix), probabilité, effectif (si une population est donnée).
 * - C : équation de table (choix), t.
 * - D : équation de table (choix), z, borne a.
 * - E : nombre d'écarts-types, proportion, effectif (si une population est donnée).
 */
export type PhaseLoiNormale = "aForme" | "aProba" | "bZ" | "bForme" | "bProba" | "bEffectif" | "cEquation" | "cT" | "dEquation" | "dZ" | "dA" | "eK" | "eProportion" | "eEffectif";

export function phasesPourExercice(e: ExerciceLoiNormale): PhaseLoiNormale[] {
  switch (e.famille) {
    case "A":
      return ["aForme", "aProba"];
    case "B":
      return e.population === null ? ["bZ", "bForme", "bProba"] : ["bZ", "bForme", "bProba", "bEffectif"];
    case "C":
      return ["cEquation", "cT"];
    case "D":
      return ["dEquation", "dZ", "dA"];
    case "E":
      return e.population === null ? ["eK", "eProportion"] : ["eK", "eProportion", "eEffectif"];
  }
}
