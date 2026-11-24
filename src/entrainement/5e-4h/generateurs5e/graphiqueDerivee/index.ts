import type { ExerciceGraphiqueDerivee, VarianteGraphiqueDerivee } from "../../core5e/graphiqueDerivee";

/**
 * Couche A — générateur de `5gen74` « Du graphique de f′ aux variations de f ». `Math.random()` seul
 * (le `?code=` rejoue le tirage). Zéros et extremums de f′ ENTIERS, dans [−4 ; 4], valeur extrême
 * de f′ entière et non nulle (sauf zéro double), |valeur| ≤ 4 :
 * - deuxZeros : (d, k) ∈ {(1, ±1), (2, ±1), (2, ±1/2)}, h de −2 à 2 ;
 * - zeroDouble : k ∈ {±1, ±1/2}, h de −3 à 3 ;
 * - sansZero : (e, k) ∈ {(1, ±1), (2, ±1), (2, ±1/2)}, h de −3 à 3 ;
 * - cubique : k = ±1/2, t = ±1, a, b = a + 3t et a + 2t dans [−4 ; 4].
 * Libre : variante tirée au hasard (les trois paraboles = un tiers du groupe chacune).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

/** Développe k·∏(x − rᵢ) (coefficients, plus haut degré d'abord). */
function developper(k: number, racines: number[]): number[] {
  let c = [k];
  for (const r of racines) {
    const n = [...c, 0];
    for (let i = 0; i < c.length; i++) n[i + 1]! -= r * c[i]!;
    c = n;
  }
  return c.map((v) => (Object.is(v, -0) ? 0 : v));
}

export function construire(variante: VarianteGraphiqueDerivee): ExerciceGraphiqueDerivee {
  if (variante === "deuxZeros") {
    const [d, k] = parmi([[1, 1], [1, -1], [2, 1], [2, -1], [2, 0.5], [2, -0.5]] as const);
    const h = entier(-2, 2);
    return { variante, coefs: developper(k, [h - d, h + d]), zeros: [{ x: h - d, double: false }, { x: h + d, double: false }], inflexions: [h] };
  }
  if (variante === "zeroDouble") {
    const k = parmi([1, -1, 0.5, -0.5]);
    const h = entier(-3, 3);
    return { variante, coefs: developper(k, [h, h]), zeros: [{ x: h, double: true }], inflexions: [h] };
  }
  if (variante === "sansZero") {
    const [ee, k] = parmi([[1, 1], [1, -1], [2, 1], [2, -1], [2, 0.5], [2, -0.5]] as const);
    const h = entier(-3, 3);
    // k((x − h)² + e) = k x² − 2kh x + k(h² + e)
    return { variante, coefs: [k, -2 * k * h, k * (h * h + ee)].map((v) => (Object.is(v, -0) ? 0 : v)), zeros: [], inflexions: [h] };
  }
  const k = parmi([0.5, -0.5]);
  const t = parmi([1, -1]);
  const a = t > 0 ? entier(-4, 1) : entier(-1, 4);
  const b = a + 3 * t;
  const zeros = [{ x: a, double: true }, { x: b, double: false }].sort((u, v) => u.x - v.x);
  return { variante, coefs: developper(k, [a, a, b]), zeros, inflexions: [a, a + 2 * t].sort((u, v) => u - v) };
}

export const CATALOGUE_VARIANTES: { id: VarianteGraphiqueDerivee; label: string }[] = [
  { id: "deuxZeros", label: "Parabole : f′ s'annule deux fois en changeant de signe" },
  { id: "zeroDouble", label: "Parabole : f′ s'annule sans changer de signe (palier)" },
  { id: "sansZero", label: "Parabole : f′ ne s'annule pas" },
  { id: "cubique", label: "Cubique : un zéro double et un zéro simple" },
];

export function construireAvecVarianteId(id: string): ExerciceGraphiqueDerivee {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceGraphiqueDerivee(): ExerciceGraphiqueDerivee {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
