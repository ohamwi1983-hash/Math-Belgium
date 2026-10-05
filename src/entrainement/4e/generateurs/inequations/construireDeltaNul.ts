import type { Enonce } from "../../core/inequation.types";
import { randomInt, randomNonZeroInt } from "./aleatoire";

/**
 * a(x-r)² = ax²+bx+c, avec b=-2ar, c=a·r².
 * Δ = b²-4ac = 0 garanti par construction, racine double r toujours rationnelle (entière).
 */
export function construireDeltaNul(): { enonce: Enonce; delta: number; racines: [number, number] } {
  const a = randomNonZeroInt(-4, 4);
  const r = randomInt(-6, 6);
  const b = -2 * a * r;
  const c = a * r * r;
  const delta = b * b - 4 * a * c;

  return { enonce: { a, b, c }, delta, racines: [r, r] };
}
