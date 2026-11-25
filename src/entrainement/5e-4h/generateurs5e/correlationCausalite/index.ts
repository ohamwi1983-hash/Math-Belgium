import type { TypeExplication } from "../../core5e/banqueCorrelationCausalite";
import { BANQUE_CORRELATION, TYPES_EXPLICATION } from "../../core5e/banqueCorrelationCausalite";
import { entier, melanger, parmi } from "../../core5e/statistiqueLotH2";

/**
 * Couche A — générateur de `5gen80` « Corrélation ou causalité ? ». Le TYPE d'explication (= variante,
 * groupe à verdict `groupe_explication`) est tiré EN PREMIER, à parts égales (un cinquième chacun),
 * puis une situation rédigée de ce type (banque relue, 9 par type) et l'ordre des quatre explications
 * de l'écran 2. `Math.random()` seul : le `?code=` rouvre la même situation dans le même ordre.
 */

export interface ExerciceCorrelationCausalite {
  variante: TypeExplication;
  indice: number;
  /** Ordre d'affichage des quatre explications (0 = la bonne, 1–3 = les leurres). */
  ordre: number[];
}

export const CATALOGUE_VARIANTES: { id: TypeExplication; label: string }[] = [
  { id: "causeCommune", label: "Cause commune (troisième variable)" },
  { id: "coincidence", label: "Coïncidence" },
  { id: "causaliteInverse", label: "Causalité inverse" },
  { id: "effetDecale", label: "Effet décalé dans le temps" },
  { id: "causalitePlausible", label: "Causalité plausible" },
];

export function construire(v: TypeExplication): ExerciceCorrelationCausalite {
  return { variante: v, indice: entier(0, BANQUE_CORRELATION[v].length - 1), ordre: melanger([0, 1, 2, 3]) };
}

export function construireAvecVarianteId(id: string): ExerciceCorrelationCausalite {
  const v = TYPES_EXPLICATION.find((t) => t === id) ?? parmi(TYPES_EXPLICATION);
  return construire(v);
}

export function genererExerciceCorrelationCausalite(): ExerciceCorrelationCausalite {
  return construire(parmi(TYPES_EXPLICATION));
}
