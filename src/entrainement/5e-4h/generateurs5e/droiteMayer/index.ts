import { CONTEXTES_REELS, serieDuContexte } from "../../core5e/contextesStat2vLotH1";
import type { ExerciceDroiteMayer, VarianteDroiteMayer } from "../../core5e/droiteMayer";
import type { Pt } from "../../core5e/stat2vLotH1";
import { arrondi, decimales, entier, mayer, melanger, parmi, pointMoyen, somme } from "../../core5e/stat2vLotH1";

/**
 * Couche A — générateur de `5gen36` « Droite de Mayer ». `Math.random()` seul.
 * - pair : n ∈ {6, 8, 10}, données rangées ; impair : n ∈ {7, 9} (groupes k et k + 1) ; desordre : n de 6 à 9,
 *   données mélangées (on vérifie que les k premières colonnes ne sont PAS le premier groupe) ;
 * - contextes `CONTEXTES_REELS` (espérance de vie en Belgique : vraies données, années centrées sur 2000,
 *   n = 8 seulement) ;
 * - moyennes de groupe EXACTES : un groupe de 3 points a des sommes divisibles par 3 (abscisses retirées,
 *   dernière ordonnée corrigée d'une unité du relevé) ;
 * - pente demandée avec au moins trois chiffres significatifs (10⁻² si |a| ≥ 1, 10⁻³ si |a| ≥ 0,1, 10⁻⁴
 *   sinon), b au centième, prévision à la précision du relevé (au moins au dixième), x₀ dans les données
 *   ou juste au-delà.
 */

function decimalesPente(a: number): number {
  const v = Math.abs(a);
  return v >= 1 ? 2 : v >= 0.1 ? 3 : 4;
}

/** Corrige la dernière ordonnée d'un groupe de 3 pour que sa somme soit divisible par 3. */
function corrigerGroupe(g: Pt[], dy: number): Pt[] {
  if (g.length !== 3) return g;
  const u = g.map((p) => Math.round(p.y * 10 ** dy));
  const reste = ((somme(u) % 3) + 3) % 3;
  if (reste === 0) return g;
  const c = [...g];
  c[2] = { x: c[2]!.x, y: arrondi((u[2]! - reste) / 10 ** dy, dy) };
  return c;
}

export function construire(variante: VarianteDroiteMayer): ExerciceDroiteMayer {
  for (;;) {
    const contextes = CONTEXTES_REELS.filter((c) => !(c.reelles && variante === "impair"));
    const c = parmi(contextes);
    const n = c.reelles ? c.reelles.length : variante === "pair" ? parmi([6, 8, 10]) : variante === "impair" ? parmi([7, 9]) : entier(6, 9);
    let tries = serieDuContexte(c, n).sort((p, q) => p.x - q.x);
    if (tries.length !== n) continue;
    const k = Math.floor(n / 2);
    if (!c.reelles) {
      const g1 = corrigerGroupe(tries.slice(0, k), c.dy);
      const g2 = corrigerGroupe(tries.slice(k), c.dy);
      if (g1.length === 3 && Math.round(somme(g1.map((p) => p.x * 10 ** c.dx))) % 3 !== 0) continue;
      if (g2.length === 3 && Math.round(somme(g2.map((p) => p.x * 10 ** c.dx))) % 3 !== 0) continue;
      tries = [...g1, ...g2];
      if (tries.some((p) => p.y <= 0)) continue;
    }
    const m = mayer(tries);
    if ([m.G1.x, m.G1.y, m.G2.x, m.G2.y].some((v) => decimales(v) > 3)) continue;
    if (Math.abs(m.a) < 0.005) continue;
    let points = tries;
    if (variante === "desordre") {
      points = melanger(tries);
      const premiers = points.slice(0, k).map((p) => p.x).sort((a, b) => a - b);
      if (premiers.every((x, i) => x === tries[i]!.x)) continue;
    }
    const da = decimalesPente(m.a);
    const db = 2;
    const dp = c.dy === 0 ? 0 : Math.max(1, c.dy);
    const xmin = tries[0]!.x;
    const xmax = tries[n - 1]!.x;
    const pasX = (xmax - xmin) / (n - 1);
    const candidats = Array.from({ length: 40 }, (_, i) => arrondi(xmin + ((i - 6) * (xmax - xmin)) / 30, c.dx)).filter((x) => !tries.some((p) => Math.abs(p.x - x) < pasX / 3) && x > 0);
    if (candidats.length === 0) continue;
    const x0 = arrondi(parmi(candidats), c.dx === 0 && xmax - xmin > 20 ? 0 : c.dx);
    if (m.a * x0 + m.b <= 0) continue;
    return { variante, contexteId: c.id, points, dx: c.dx, dy: c.dy, m, G: pointMoyen(tries), da, db, dp, x0 };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteDroiteMayer; label: string }[] = [
  { id: "pair", label: "Données rangées, n pair" },
  { id: "impair", label: "Données rangées, n impair (groupes k et k + 1)" },
  { id: "desordre", label: "Données dans le désordre" },
];

export function construireAvecVarianteId(id: string): ExerciceDroiteMayer {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceDroiteMayer(): ExerciceDroiteMayer {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
