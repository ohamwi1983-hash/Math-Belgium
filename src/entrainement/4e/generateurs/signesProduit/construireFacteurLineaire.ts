import type { FacteurLineaire } from "../../core/signesProduit.types";
import { randomInt } from "../secondDegre/aleatoire";

const VALEURS_K = [-3, -2, -1, 1, 2, 3];

/** k(x - p) — k non nul, p entier dans [-6,6] en excluant toute racine déjà utilisée par un autre facteur. */
export function construireFacteurLineaire(racinesExclues: number[]): { facteur: FacteurLineaire; racine: number } {
  const k = VALEURS_K[randomInt(0, VALEURS_K.length - 1)];
  let p = randomInt(-6, 6);
  while (racinesExclues.includes(p)) p = randomInt(-6, 6);
  return { facteur: { type: "lineaire", polynome: { k, p } }, racine: p };
}
