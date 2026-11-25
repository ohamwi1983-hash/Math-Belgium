import { CONTEXTES_PETITS, CONTEXTES_REELS, serieDuContexte } from "../../core5e/contextesStat2vLotH1";
import type { ExerciceMoindresCarres, VarianteMoindresCarres } from "../../core5e/moindresCarres";
import { serieMoindresCarres } from "../../core5e/petitesSeriesLotH1";
import { arrondi, correlation, entier, moindresCarres, parmi, pointMoyen, sommesEcarts } from "../../core5e/stat2vLotH1";

/**
 * Couche A — générateur de `5gen37` « Droite des moindres carrés ». `Math.random()` seul.
 * - main : petite série (`serieMoindresCarres` : 5 ou 6 points, x̄ et ȳ entiers, a décimal court) ; x₀ entier
 *   dans l'intervalle des données ou juste à côté ; toutes les réponses sont EXACTES ;
 * - calculatrice : série d'un contexte réel (7 à 10 points, |r| ≥ 0,85), a arrondi avec trois chiffres
 *   significatifs, b au centième, prévision de y à la précision du relevé (au moins au dixième), de x au
 *   dixième (au centième si les x sont au dixième).
 */

export function decimalesPente(a: number): number {
  const v = Math.abs(a);
  return v >= 1 ? 2 : v >= 0.1 ? 3 : 4;
}

function construireMain(): ExerciceMoindresCarres {
  const c = parmi(CONTEXTES_PETITS);
  const n = parmi([5, 6]);
  const { points, a } = serieMoindresCarres(c, n);
  const G = pointMoyen(points);
  const { sXY, sX2 } = sommesEcarts(points);
  const b = arrondi(G.y - a * G.x, 6);
  const xs = points.map((p) => p.x);
  let x0 = entier(Math.min(...xs) - 1, Math.max(...xs) + 2);
  for (let i = 0; i < 50 && (xs.includes(x0) || x0 < 0 || a * x0 + b < 0); i++) x0 = entier(Math.min(...xs) - 1, Math.max(...xs) + 2);
  if (xs.includes(x0) || x0 < 0 || a * x0 + b < 0) return construireMain();
  return { variante: "main", contexteId: c.id, points, dx: 0, dy: 0, G, a, b, sXY, sX2, da: 2, db: 2, dp: 2, dpx: 2, x0 };
}

function construireCalculatrice(): ExerciceMoindresCarres {
  for (;;) {
    const c = parmi(CONTEXTES_REELS);
    const n = c.reelles ? c.reelles.length : entier(7, 10);
    const points = serieDuContexte(c, n).sort((p, q) => p.x - q.x);
    if (Math.abs(correlation(points)) < 0.85) continue;
    const G = pointMoyen(points);
    const { a, b } = moindresCarres(points);
    const { sXY, sX2 } = sommesEcarts(points);
    const xs = points.map((p) => p.x);
    const xmin = Math.min(...xs);
    const xmax = Math.max(...xs);
    const e = xmax - xmin;
    const x0 = arrondi(xmin + e * (-0.1 + 1.2 * Math.random()), c.dx);
    if (xs.some((x) => Math.abs(x - x0) < e / (3 * n)) || a * x0 + b <= 0) continue;
    const ys = points.map((p) => p.y);
    const ymin = Math.min(...ys);
    const ymax = Math.max(...ys);
    const y0 = arrondi(ymin + (ymax - ymin) * (0.15 + 0.7 * Math.random()), c.dy);
    if (ys.includes(y0)) continue;
    return { variante: "calculatrice", contexteId: c.id, points, dx: c.dx, dy: c.dy, G, a, b, sXY, sX2, da: decimalesPente(a), db: 2, dp: Math.max(1, c.dy), dpx: c.dx + 1, x0, y0 };
  }
}

export function construire(variante: VarianteMoindresCarres): ExerciceMoindresCarres {
  return variante === "main" ? construireMain() : construireCalculatrice();
}

export const CATALOGUE_VARIANTES: { id: VarianteMoindresCarres; label: string }[] = [
  { id: "main", label: "À la main : petite série, tableau des écarts" },
  { id: "calculatrice", label: "À la calculatrice : série réelle, prévisions" },
];

export function construireAvecVarianteId(id: string): ExerciceMoindresCarres {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceMoindresCarres(): ExerciceMoindresCarres {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
