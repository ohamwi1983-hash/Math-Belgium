import type { ExerciceTI, FamilleTI } from "../../core6e/termeIndependant";
import { PUISSANCES, termeIndependant } from "../../core6e/termeIndependant";
import { parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen107` « Terme indépendant ». `Math.random()` seul (le `?code=` rejoue
 * le tirage). Le VERDICT (le terme indépendant existe ou non) est tiré EN PREMIER à parts égales ;
 * la variante fixe la famille (xᵖ, 1/x^q) ; n est ensuite choisi parmi les valeurs qui donnent ce
 * verdict, puis a et b (|terme| ≤ 2 000 000, a et b jamais tous deux égaux à 1).
 */

export const CATALOGUE_VARIANTES: { id: FamilleTI; label: string }[] = [
  { id: "x_x", label: "(ax + b·x⁻¹)ⁿ" },
  { id: "x2_x", label: "(ax² + b·x⁻¹)ⁿ" },
  { id: "x_x2", label: "(ax + b·x⁻²)ⁿ" },
  { id: "x3_x", label: "(ax³ + b·x⁻¹)ⁿ" },
];

const N_MIN = 4;
const N_MAX: Record<FamilleTI, number> = { x_x: 10, x2_x: 12, x_x2: 12, x3_x: 12 };

export function construire(v: FamilleTI, existe: boolean = Math.random() < 0.5): ExerciceTI {
  const { p, q } = PUISSANCES[v];
  const ns: number[] = [];
  for (let n = N_MIN; n <= N_MAX[v]; n++) if (((p * n) % (p + q) === 0) === existe) ns.push(n);
  for (;;) {
    const n = parmi(ns);
    const a = parmi([1, 1, 2, 3]);
    const b = parmi([-3, -2, -1, 1, 2, 3]);
    if (a === 1 && Math.abs(b) === 1) continue;
    const e: ExerciceTI = { variante: v, a, b, n };
    if (Math.abs(termeIndependant(e)) > 2_000_000) continue;
    return e;
  }
}

export function construireAvecVariante(id: string): ExerciceTI {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceTI(): ExerciceTI {
  const existe = Math.random() < 0.5;
  return construire(parmi(CATALOGUE_VARIANTES).id, existe);
}
