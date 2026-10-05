import type { Enonce } from "../../core/inequation.types";
import { randomInt, randomNonZeroInt } from "./aleatoire";

/** Deux racines entières distinctes r1<r2, tirées indépendamment du signe de a. */
function racinesDistinctes(min: number, max: number): [number, number] {
  const r1 = randomInt(min, max);
  let r2 = randomInt(min, max);
  while (r2 === r1) r2 = randomInt(min, max);
  return r1 < r2 ? [r1, r2] : [r2, r1];
}

/**
 * a(x-r1)(x-r2) = ax²+bx+c, avec b=-a(r1+r2), c=a·r1·r2.
 * Δ = a²(r1-r2)² > 0 garanti, racines toujours rationnelles (entières).
 */
export function construireDeltaPositif(): { enonce: Enonce; delta: number; racines: [number, number] } {
  const a = randomNonZeroInt(-4, 4);
  const [r1, r2] = racinesDistinctes(-6, 6);
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  const delta = b * b - 4 * a * c;

  return { enonce: { a, b, c }, delta, racines: [r1, r2] };
}
