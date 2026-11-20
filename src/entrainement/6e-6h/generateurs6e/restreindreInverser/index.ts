import type { ExerciceRestreindre, VarianteRestreindre } from "../../core6e/restreindreInverser";
import { Y0_COS, Y0_SIN, Y0_TAN, bornesTrig } from "../../core6e/restreindreInverser";
import { q } from "../../../5e-4h/ui5e/nombresTrigo";

/**
 * Couche A — générateur de `6gen159` « Restreindre pour inverser ». `Math.random()` seul (`?code=`).
 * - `trinome` : f(x) = a(x − h)² + k développé, a = ±1, h ∈ {±1, ±2, ±3}, k ∈ [−5 ; 5], x₀ = h ± 1 ou
 *   h ± 2 (côté tiré 50/50) ;
 * - `sinus` : restriction [π/2 + jπ ; 3π/2 + jπ], j ∈ {0, 1, −2} ; `cosinus` : [jπ ; (j + 1)π],
 *   j ∈ {1, −1, 2} ; `tangente` : ]−π/2 + jπ ; π/2 + jπ[, j ∈ {1, −1, 2} — jamais la restriction
 *   principale du cours ; x₀ = borne gauche + π/3, + π/2 ou + 2π/3 (tangente : centre ± π/4 ou centre) ;
 *   y₀ remarquable (sinus et cosinus : ±1/2, ±√2/2, ±√3/2 ; tangente : ±1, ±√3, ±√3/3).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

export function construire(variante: VarianteRestreindre): ExerciceRestreindre {
  if (variante === "trinome") {
    const a = parmi([1, -1] as const);
    const h = parmi([-3, -2, -1, 1, 2, 3]);
    const k = parmi([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);
    const s = parmi([1, -1] as const);
    const x0 = h + s * parmi([1, 2]);
    return { variante, a, h, k, s, x0, cleCollecteur: `trinome/${a > 0 ? "a+" : "a-"}/${s > 0 ? "droite" : "gauche"}` };
  }
  const j = variante === "sinus" ? parmi([0, 1, -2]) : parmi([1, -1, 2]);
  const e0 = { variante, j, x0: q(0), y0: Y0_SIN[0], cleCollecteur: `${variante}/j${j}` } as Extract<ExerciceRestreindre, { variante: "sinus" | "cosinus" | "tangente" }>;
  const [g] = bornesTrig(e0);
  const decal = variante === "tangente" ? parmi([q(1, 4), q(1, 2), q(3, 4)]) : parmi([q(1, 3), q(1, 2), q(2, 3)]);
  const x0 = q(g.n * decal.d + decal.n * g.d, g.d * decal.d);
  const y0 = parmi(variante === "sinus" ? Y0_SIN : variante === "cosinus" ? Y0_COS : Y0_TAN);
  return { ...e0, x0, y0 };
}

export const CATALOGUE_VARIANTES: { id: VarianteRestreindre; label: string }[] = [
  { id: "trinome", label: "Un trinôme, restreint d'un côté du sommet" },
  { id: "sinus", label: "sin sur un autre intervalle que [−π/2 ; π/2]" },
  { id: "cosinus", label: "cos sur un autre intervalle que [0 ; π]" },
  { id: "tangente", label: "tan sur un autre intervalle que ]−π/2 ; π/2[" },
];

export function construireAvecVarianteId(id: VarianteRestreindre): ExerciceRestreindre {
  return construire(id);
}

export function genererExerciceRestreindre(): ExerciceRestreindre {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
