import type { PolynomeLineaire } from "../../core/simplification.types";
import { randomInt } from "../secondDegre/aleatoire";

/** k(x - p), k non nul — pas de technique à choisir pour un P1 (section 2 de la spec). */
export function construirePolynomeLineaire(p: number): PolynomeLineaire {
  return { k: randomInt(1, 4), p };
}
