import type { ExerciceContenanceObjets, Frac, ProfilContenance } from "./contenanceObjets.types";

/**
 * Calculs exacts partagés par les couches A (génération), B (vérification) et ui de `6gen83` —
 * placés dans `core6e/` pour que ni la génération ni la vérification n'importent l'autre (même
 * règle que 6gen27). Fractions à numérateur/dénominateur entiers (`number` : les plus grands
 * produits, tonneau, restent < 10¹⁵), polynômes à coefficients `Frac` (indice = degré).
 */

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

export function frac(num: number, den = 1): Frac {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = pgcd(num, den);
  return { num: num / g || 0, den: den / g };
}

export const ZERO: Frac = { num: 0, den: 1 };

export function plus(p: Frac, q: Frac): Frac {
  return frac(p.num * q.den + q.num * p.den, p.den * q.den);
}
export function moins(p: Frac, q: Frac): Frac {
  return frac(p.num * q.den - q.num * p.den, p.den * q.den);
}
export function fois(p: Frac, q: Frac): Frac {
  return frac(p.num * q.num, p.den * q.den);
}
export function valeur(p: Frac): number {
  return p.num / p.den;
}

/** Puissance entière (n ≥ 0) d'une fraction. */
function puissance(p: Frac, n: number): Frac {
  let r: Frac = frac(1);
  for (let i = 0; i < n; i++) r = fois(r, p);
  return r;
}

/** P(x) exact pour x rationnel. */
export function evaluerPolynomeExact(coefs: Frac[], x: Frac): Frac {
  return coefs.reduce((acc, c, n) => plus(acc, fois(c, puissance(x, n))), ZERO);
}

export function evaluerPolynome(coefs: Frac[], x: number): number {
  return coefs.reduce((acc, c, n) => acc + valeur(c) * x ** n, 0);
}

/** Primitive (constante nulle) d'un polynôme. */
export function primitivePolynome(coefs: Frac[]): Frac[] {
  return [ZERO, ...coefs.map((c, n) => fois(c, frac(1, n + 1)))];
}

/** [f(x)]² développé, à partir du profil. */
export function carreProfil(p: ProfilContenance): Frac[] {
  switch (p.type) {
    case "racine":
      return [ZERO, frac(p.a)];
    case "parabole":
      return [frac(p.r * p.r), ZERO, frac(2 * p.r, p.n), ZERO, frac(1, p.n * p.n)];
    case "bombe":
      return [frac(p.R * p.R), ZERO, frac(-2 * p.R, p.n), ZERO, frac(1, p.n * p.n)];
    case "ellipse":
      return [frac(p.b * p.b), ZERO, frac(-p.b * p.b, p.a * p.a)];
    case "droite": {
      const m = frac(p.R - p.r, p.h);
      return [frac(p.r * p.r), fois(frac(2 * p.r), m), fois(m, m)];
    }
  }
}

/** f(x) (rayon intérieur, cm). */
export function rayonProfil(p: ProfilContenance, x: number): number {
  switch (p.type) {
    case "racine":
      return Math.sqrt(Math.max(0, p.a * x));
    case "parabole":
      return p.r + (x * x) / p.n;
    case "bombe":
      return p.R - (x * x) / p.n;
    case "ellipse":
      return (p.b / p.a) * Math.sqrt(Math.max(0, p.a * p.a - x * x));
    case "droite":
      return p.r + ((p.R - p.r) * x) / p.h;
  }
}

/** (1/π)·∫ₐᵇ [f(x)]² dx exact, a et b entiers. */
export function volumeSurPiEntre(carre: Frac[], a: number, b: number): Frac {
  const P = primitivePolynome(carre);
  return moins(evaluerPolynomeExact(P, frac(b)), evaluerPolynomeExact(P, frac(a)));
}

/** π∫ₐᵗ [f(x)]² dx (cm³), t réel. */
export function volumeJusqua(e: ExerciceContenanceObjets, t: number): number {
  const P = primitivePolynome(e.carre);
  return Math.PI * (evaluerPolynome(P, t) - evaluerPolynome(P, e.a));
}

export function volumeCm3(e: ExerciceContenanceObjets): number {
  return Math.PI * valeur(e.volumeSurPi);
}

/** Unité de la contenance demandée : cL (verre, flacon) ou L (vase, tonneau, pot). */
export function uniteContenance(e: ExerciceContenanceObjets): "cL" | "L" {
  return e.objet === "verre" || e.objet === "flacon" ? "cL" : "L";
}

/** Contenance dans l'unité du contexte (1 L = 1 dm³ = 1 000 cm³ ; 1 cL = 10 cm³). */
export function contenanceUnite(e: ExerciceContenanceObjets): number {
  return volumeCm3(e) / (uniteContenance(e) === "cL" ? 10 : 1000);
}

/** Volume du second objet (cm³). */
export function volumeSecond(e: ExerciceContenanceObjets): number {
  return e.secondSurPi ? Math.PI * valeur(e.secondSurPi) : 0;
}
