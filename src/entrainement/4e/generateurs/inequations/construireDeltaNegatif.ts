import type { Enonce } from "../../core/inequation.types";
import { randomInt, randomNonZeroInt } from "./aleatoire";

/**
 * Tire a et b librement, puis choisit c strictement au-delà du seuil c0 = b²/(4a) dans le sens
 * qui garantit 4ac > b² (donc Δ = b²-4ac < 0) — le sens dépend du signe de a puisque diviser
 * l'inégalité 4ac > b² par 4a inverse le sens quand a < 0. Aucune contrainte de racines
 * rationnelles ici : Δ<0 signifie qu'il n'y a pas de racine réelle.
 */
export function construireDeltaNegatif(): { enonce: Enonce; delta: number; racines?: [number, number] } {
  const a = randomNonZeroInt(-4, 4);
  const b = randomInt(-6, 6);
  const seuil = (b * b) / (4 * a);
  const marge = randomInt(1, 4);
  const c = a > 0 ? Math.floor(seuil) + marge : Math.ceil(seuil) - marge;
  const delta = b * b - 4 * a * c;

  return { enonce: { a, b, c }, delta };
}
