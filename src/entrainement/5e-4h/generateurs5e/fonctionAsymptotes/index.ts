import type { ExerciceFonctionAsymptotes, VarianteFonctionAsymptotes } from "../../core5e/fonctionAsymptotes";
import { FENETRE } from "../../core5e/fonctionAsymptotes";

/**
 * Couche A — générateur de `5gen65` « Retrouver une fonction à partir de ses asymptotes ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). Tout est entier :
 * - homographique : p ≠ 0 de −4 à 4, k ≠ 0 de −4 à 4, A(x₀ ; y₀) entier, b de −12 à 12, kp + b ≠ 0 ;
 * - oblique : m ∈ {±1, ±2}, q de −5 à 5, p ≠ 0 de −4 à 4, x₀ − p diviseur de c, c ∈ {±1, ±2, ±3, ±4, ±6} ;
 * - graphiques : mêmes formes dans la fenêtre [−7 ; 7]² (p, k de −3 à 3 ; m = ±1, |q| ≤ 2), A à au
 *   moins une unité des asymptotes et dans le cadre (|x₀|, |y₀| ≤ 6).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const nonNul = (a: number, b: number) => {
  for (;;) {
    const v = entier(a, b);
    if (v !== 0) return v;
  }
};

function homographique(graphe: boolean): Record<string, number> {
  for (;;) {
    const lim = graphe ? 3 : 4;
    const p = nonNul(-lim, lim);
    const k = nonNul(-lim, lim);
    const x0 = p + parmi([-3, -2, -1, 1, 2, 3]);
    const y0 = graphe ? entier(-6, 6) : entier(-8, 8);
    const b = y0 * (x0 - p) - k * x0;
    if (Math.abs(b) > 12 || k * p + b === 0 || y0 === k) continue;
    if (graphe && (Math.abs(x0) > 6 || Math.abs(y0 - k) < 1 || Math.abs(x0) < 1 && Math.abs(y0) < 1)) continue;
    if (graphe) {
      // La courbe doit rester lisible : |f| ≤ 7 aux bords de la fenêtre (asymptote vue de loin).
      const f = (x: number) => (k * x + b) / (x - p);
      if (Math.abs(f(FENETRE.xmin)) > 6.5 || Math.abs(f(FENETRE.xmax)) > 6.5) continue;
    }
    return { p, k, x0, y0, b };
  }
}

function oblique(graphe: boolean): Record<string, number> {
  for (;;) {
    const m = graphe ? parmi([1, -1]) : parmi([1, -1, 2, -2]);
    const q = graphe ? entier(-2, 2) : entier(-5, 5);
    const p = graphe ? nonNul(-2, 2) : nonNul(-4, 4);
    const c = parmi(graphe ? [1, 2, 3, 4, -1, -2, -3, -4] : [1, 2, 3, 4, 6, -1, -2, -3, -4, -6]);
    const diviseurs = [1, 2, 3, 4, 6].filter((x) => c % x === 0);
    const delta = parmi(diviseurs) * parmi([1, -1]);
    const x0 = p + delta;
    const y0 = m * x0 + q + c / delta;
    if (!Number.isInteger(y0)) continue;
    if (graphe && (Math.abs(x0) > 6 || Math.abs(y0) > 6 || Math.abs(delta) < 1)) continue;
    if (!graphe && Math.abs(y0) > 20) continue;
    return { p, m, q, c, x0, y0 };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteFonctionAsymptotes; label: string }[] = [
  { id: "homographique", label: "(ax + b)/(x + d) : AV, AH et un point" },
  { id: "oblique", label: "ax + b + c/(x − p) : AV, AO et un point" },
  { id: "graphiqueHomographique", label: "(ax + b)/(x + d) lue sur un graphique" },
  { id: "graphiqueOblique", label: "ax + b + c/(x − p) lue sur un graphique" },
];

export function construire(variante: VarianteFonctionAsymptotes): ExerciceFonctionAsymptotes {
  const graphe = variante.startsWith("graphique");
  const d = variante === "homographique" || variante === "graphiqueHomographique" ? homographique(graphe) : oblique(graphe);
  return { variante, d };
}

export function construireAvecVarianteId(id: string): ExerciceFonctionAsymptotes {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceFonctionAsymptotes(): ExerciceFonctionAsymptotes {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
