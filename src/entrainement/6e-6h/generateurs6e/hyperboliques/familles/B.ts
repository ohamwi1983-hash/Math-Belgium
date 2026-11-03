import type { ExerciceHyperboliquesB } from "../../../core6e/hyperboliques.types";
import { tirerParmi } from "../aleatoire";

/** k = sh(x0), rationnel non nul (peut être négatif) — fractions choisies pour que √(1+k²) reste
 * lisible (3/4 → 5/4, 4/3 → 5/3, 1/2 → √5/2). */
const K_TROUVER_CH: readonly [number, number][] = [
  [1, 1], [2, 1], [3, 1], [4, 1], [1, 2], [3, 4], [4, 3],
  [-1, 1], [-2, 1], [-3, 1], [-4, 1], [-1, 2], [-3, 4], [-4, 3],
];
/** k = ch(x0), rationnel STRICTEMENT supérieur à 1 (sinon k²−1 ≤ 0 sous la racine). */
const K_TROUVER_SH: readonly [number, number][] = [
  [2, 1], [3, 1], [4, 1], [5, 1], [5, 4], [5, 3], [3, 2],
];

function fraction([kNum, kDen]: readonly [number, number]) {
  return { k: kNum / kDen, kNum, kDen };
}

/** "donné sh, trouver ch". */
export function construireBTrouverCh(overrides?: { kNum?: number; kDen?: number }): ExerciceHyperboliquesB {
  const paire: [number, number] = overrides?.kNum !== undefined ? [overrides.kNum, overrides.kDen ?? 1] : [...tirerParmi(K_TROUVER_CH)];
  return { famille: "B", sousType: "trouverCh", ...fraction(paire) };
}

/** "donné ch, trouver sh". `signeX0` : 40% du temps un signe est précisé (une seule valeur
 * attendue), sinon `null` (les 2 valeurs ±√(k²−1) sont attendues — piège central). */
export function construireBTrouverSh(overrides?: { kNum?: number; kDen?: number; signeX0?: 1 | -1 | null }): ExerciceHyperboliquesB {
  const paire: [number, number] = overrides?.kNum !== undefined ? [overrides.kNum, overrides.kDen ?? 1] : [...tirerParmi(K_TROUVER_SH)];
  const signeX0 = overrides && "signeX0" in overrides ? (overrides.signeX0 ?? null) : Math.random() < 0.4 ? tirerParmi([1, -1] as const) : null;
  return { famille: "B", sousType: "trouverSh", ...fraction(paire), signeX0 };
}

/** Sous-type tiré ÉQUIPROBABLE parmi "trouverCh"/"trouverSh". */
export function construireB(): ExerciceHyperboliquesB {
  return Math.random() < 0.5 ? construireBTrouverCh() : construireBTrouverSh();
}

export { K_TROUVER_CH, K_TROUVER_SH };
