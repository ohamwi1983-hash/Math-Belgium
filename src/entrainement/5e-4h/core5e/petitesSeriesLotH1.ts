import type { ContextePetit } from "./contextesStat2vLotH1";
import type { ClasseR, Pt } from "./stat2vLotH1";
import { classeR, correlation, decimales, distanceSeuil, entier, melanger, normale, parmi, somme } from "./stat2vLotH1";

/**
 * Petites séries « faites pour le calcul à la main » (décision du professeur : moindres carrés à la main
 * seulement sur 5 ou 6 points à moyennes simples) — 5gen37 et 5gen38, variantes `main` : abscisses
 * entières distinctes de moyenne ENTIÈRE, ordonnées entières de moyenne ENTIÈRE, donc écarts Xᵢ, Yᵢ entiers.
 */

/** n abscisses entières distinctes de [xMin ; xMax] dont la somme est divisible par n. */
export function abscissesMoyenneEntiere(c: ContextePetit, n: number): number[] {
  const toutes = Array.from({ length: c.xMax - c.xMin + 1 }, (_, i) => c.xMin + i);
  for (;;) {
    const x = melanger(toutes).slice(0, n).sort((a, b) => a - b);
    if (somme(x) % n === 0) return x;
  }
}

/** Série dont la droite des moindres carrés a une pente décimale COURTE (au plus deux décimales), de même
 * signe que les pentes du contexte, |a| de 0,2 à 3, et un coefficient |r| de 0,55 à 0,985. */
export function serieMoindresCarres(c: ContextePetit, n: number): { points: Pt[]; a: number } {
  for (;;) {
    const x = abscissesMoyenneEntiere(c, n);
    const xm = somme(x) / n;
    const X = x.map((v) => v - xm);
    const S = somme(X.map((v) => v * v));
    const signe = Math.sign(c.pentes[0]!);
    const cands: number[] = [];
    for (let m = -3 * S; m <= 3 * S; m++) {
      const a = m / S;
      if (Math.abs(a) < 0.2 || Math.abs(a) > 3 || Math.sign(a) !== signe || decimales(a) > 2) continue;
      cands.push(m);
    }
    if (cands.length === 0) continue;
    const m = parmi(cands);
    const a = m / S;
    const ym = entier(c.yMoyen[0], c.yMoyen[1]);
    for (let essai = 0; essai < 600; essai++) {
      const y = X.map((v) => Math.round(ym + a * v) + entier(-2, 2));
      if (somme(y) !== n * ym) continue;
      if (somme(X.map((v, i) => v * y[i]!)) !== m) continue;
      if (y.some((v) => v < 0) || (c.id === "revision" && y.some((v) => v > 20))) continue;
      const points = x.map((v, i) => ({ x: v, y: y[i]! }));
      const r = Math.abs(correlation(points));
      if (r < 0.55 || r > 0.985) continue;
      return { points, a };
    }
  }
}

/** Série de coefficient r dans une classe donnée du tableau du cours (à 0,025 au moins d'un seuil), de
 * signe donné, covariance décimale exacte (n = 6 : Σ XᵢYᵢ divisible par 3). */
export function serieCorrelation(c: ContextePetit, n: number, classe: ClasseR, positif: boolean): Pt[] {
  for (;;) {
    const x = abscissesMoyenneEntiere(c, n);
    const xm = somme(x) / n;
    const X = x.map((v) => v - xm);
    const ym = entier(c.yMoyen[0], c.yMoyen[1]);
    const s = (positif ? 1 : -1) * (0.5 + Math.random() * 1.5);
    const bruit = classe === "nulle" ? 2.5 + Math.random() * 2 : Math.random() * 3;
    for (let essai = 0; essai < 40; essai++) {
      const y = X.map((v) => Math.round(ym + (classe === "nulle" ? s * 0.15 : s) * v + bruit * normale()));
      const j = entier(0, n - 1);
      y[j] = y[j]! + n * ym - somme(y);
      if (y.some((v) => v < 0) || (c.id === "revision" && y.some((v) => v > 20))) continue;
      const points = x.map((v, i) => ({ x: v, y: y[i]! }));
      const sXY = somme(X.map((v, i) => v * (y[i]! - ym)));
      if (n % 3 === 0 && sXY % 3 !== 0) continue;
      const sY2 = somme(y.map((v) => (v - ym) ** 2));
      if (sY2 === 0) continue;
      const r = correlation(points);
      if (classeR(r) !== classe || distanceSeuil(r) < (classe === "tresForte" ? 0.005 : 0.025)) continue;
      if ((r > 0) !== positif) continue;
      if (classe === "nulle" && Math.abs(r) < 0.03) continue;
      if (Math.abs(r) > 0.9995) continue;
      return points;
    }
  }
}
