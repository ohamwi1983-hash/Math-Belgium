/**
 * Couche core (6e) — contrat et calculs EXACTS de `6gen94` « Valeurs exactes par deux écritures
 * d'un même complexe » (chapitre 5 de 6e, « Nombres complexes », section `formetrigonometrique`).
 * Source unique des valeurs attendues : générateur (`generateurs6e/deuxEcrituresComplexe/`),
 * vérification (`moteur6e/verificationDeuxEcritures.ts`) et textes (`ui6e/formatDeuxEcritures.ts`)
 * en dérivent tous.
 *
 * Exercice type : z = (1 + i)/(√3 + i). On l'écrit de deux façons — forme algébrique (conjugué) et
 * forme trigonométrique (module et argument de chaque facteur, puis du quotient) — et on identifie
 * les deux écritures : cos(π/12) et sin(π/12) exacts.
 *
 * - Un facteur de la famille de π/4 (« quart ») : c(±1 ± i), module c√2, argument ±π/4 ou ±3π/4.
 * - Un facteur de la famille de π/6 ou π/3 (« sixième ») : d(±√3 ± i) ou d(±1 ± i√3), module 2d,
 *   argument ±π/6, ±5π/6, ±π/3 ou ±2π/3.
 * En douzièmes de π, le premier argument vaut ±3 ou ±9, le second ±2, ±4, ±8 ou ±10 : leur somme ou
 * leur différence est impaire et jamais multiple de 3, donc l'argument de z est toujours ±π/12,
 * ±5π/12, ±7π/12 ou ±11π/12 — un angle NON remarquable dont cos et sin valent (±√6 ± √2)/4.
 *
 * Toute la partie algébrique est calculée exactement dans les nombres (p + q√3)/d (p, q, d entiers) ;
 * le module de z est toujours de la forme k√2 (k rationnel). Les angles sont des entiers t (angle
 * = tπ/12), réduits dans ]−12 ; 12] (argument principal ]−π ; π]).
 */

export type IdVarianteDeuxEcritures = "produit" | "quotient";

export type FamilleFacteur = "quart" | "sixieme";

export interface Facteur {
  famille: FamilleFacteur;
  /** Argument principal, en douzièmes de π (3 ↔ π/4, 2 ↔ π/6, 4 ↔ π/3…). */
  t: number;
  /** Coefficient c (ou d) : 1 ou 2. */
  coef: number;
}

export interface ExerciceDeuxEcritures {
  variante: IdVarianteDeuxEcritures;
  /** z = z1 · z2 (produit) ou z = z1 / z2 (quotient). */
  z1: Facteur;
  z2: Facteur;
}

// ============================================================================
// Rationnels et nombres (p + q√3)/d.
// ============================================================================

export interface Fraction {
  num: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

export function fr(num: number, den = 1): Fraction {
  if (den === 0) throw new Error("fr : dénominateur nul");
  const s = den < 0 ? -1 : 1;
  const g = pgcd(num, den) || 1;
  return { num: (s * num) / g + 0, den: (s * den) / g };
}

export function valeurFraction(f: Fraction): number {
  return f.num / f.den;
}

/** (p + q√3)/d, d > 0, pgcd(p, q, d) = 1. */
export interface NombreR3 {
  p: number;
  q: number;
  d: number;
}

export function r3(p: number, q: number, d = 1): NombreR3 {
  if (d === 0) throw new Error("r3 : dénominateur nul");
  const s = d < 0 ? -1 : 1;
  const g = pgcd(pgcd(p, q), d) || 1;
  return { p: (s * p) / g + 0, q: (s * q) / g + 0, d: (s * d) / g };
}

export function valeurR3(x: NombreR3): number {
  return (x.p + x.q * Math.sqrt(3)) / x.d;
}

function plus(a: NombreR3, b: NombreR3): NombreR3 {
  return r3(a.p * b.d + b.p * a.d, a.q * b.d + b.q * a.d, a.d * b.d);
}

function moins(a: NombreR3, b: NombreR3): NombreR3 {
  return plus(a, r3(-b.p, -b.q, b.d));
}

function fois(a: NombreR3, b: NombreR3): NombreR3 {
  return r3(a.p * b.p + 3 * a.q * b.q, a.p * b.q + a.q * b.p, a.d * b.d);
}

function diviserParEntier(a: NombreR3, n: number): NombreR3 {
  return r3(a.p, a.q, a.d * n);
}

export interface ComplexeR3 {
  re: NombreR3;
  im: NombreR3;
}

export function multiplierComplexeR3(a: ComplexeR3, b: ComplexeR3): ComplexeR3 {
  return { re: moins(fois(a.re, b.re), fois(a.im, b.im)), im: plus(fois(a.re, b.im), fois(a.im, b.re)) };
}

export function conjugueR3(a: ComplexeR3): ComplexeR3 {
  return { re: a.re, im: r3(-a.im.p, -a.im.q, a.im.d) };
}

// ============================================================================
// Angles en douzièmes de π.
// ============================================================================

/** Ramène t (douzièmes de π) dans ]−12 ; 12]. */
export function reduireDouziemes(t: number): number {
  let r = ((t % 24) + 24) % 24;
  if (r > 12) r -= 24;
  return r;
}

export function angleNumerique(t: number): number {
  return (t * Math.PI) / 12;
}

// ============================================================================
// Facteurs.
// ============================================================================

/** Partie réelle et partie imaginaire EXACTES d'un facteur. */
export function partiesFacteur(f: Facteur): ComplexeR3 {
  const sc = Math.sign(Math.round(Math.cos(angleNumerique(f.t)) * 1e9));
  const ss = Math.sign(Math.round(Math.sin(angleNumerique(f.t)) * 1e9));
  const a = Math.abs(f.t);
  if (f.famille === "quart") return { re: r3(f.coef * sc, 0), im: r3(f.coef * ss, 0) };
  if (a === 2 || a === 10) return { re: r3(0, f.coef * sc), im: r3(f.coef * ss, 0) };
  return { re: r3(f.coef * sc, 0), im: r3(0, f.coef * ss) };
}

/** Carré du module d'un facteur (entier) : 2c² ou 4d². */
export function moduleCarreFacteur(f: Facteur): number {
  return f.famille === "quart" ? 2 * f.coef * f.coef : 4 * f.coef * f.coef;
}

/** Module d'un facteur sous la forme k·√2 (quart) ou entier (sixième). */
export function moduleFacteurNumerique(f: Facteur): number {
  return Math.sqrt(moduleCarreFacteur(f));
}

// ============================================================================
// Grandeurs de z.
// ============================================================================

export function signeOperation(e: ExerciceDeuxEcritures): 1 | -1 {
  return e.variante === "produit" ? 1 : -1;
}

/** Numérateur de la forme algébrique : z1·z2 (produit) ou z1·conj(z2) (quotient, avant division). */
export function numerateurAlgebrique(e: ExerciceDeuxEcritures): ComplexeR3 {
  const a = partiesFacteur(e.z1);
  const b = partiesFacteur(e.z2);
  return multiplierComplexeR3(a, e.variante === "produit" ? b : conjugueR3(b));
}

/** Forme algébrique exacte de z. */
export function formeAlgebrique(e: ExerciceDeuxEcritures): ComplexeR3 {
  const n = numerateurAlgebrique(e);
  if (e.variante === "produit") return n;
  const N = moduleCarreFacteur(e.z2);
  return { re: diviserParEntier(n.re, N), im: diviserParEntier(n.im, N) };
}

/** Argument principal de z, en douzièmes de π. */
export function argumentZ(e: ExerciceDeuxEcritures): number {
  return reduireDouziemes(e.z1.t + signeOperation(e) * e.z2.t);
}

/** Argument de z SANS réduction (θ1 ± θ2 tel quel), en douzièmes de π. */
export function argumentBrut(e: ExerciceDeuxEcritures): number {
  return e.z1.t + signeOperation(e) * e.z2.t;
}

/** Facteur k tel que |z| = k√2. */
export function moduleZ(e: ExerciceDeuxEcritures): Fraction {
  // |quart| = c√2, |sixième| = 2d.
  const { z1, z2 } = e;
  if (e.variante === "produit") return fr(2 * z1.coef * z2.coef);
  if (z1.famille === "quart") return fr(z1.coef, 2 * z2.coef); // c√2 / (2d)
  return fr(z1.coef, z2.coef); // 2d / (c√2) = (d/c)√2
}

export function moduleZNumerique(e: ExerciceDeuxEcritures): number {
  return valeurFraction(moduleZ(e)) * Math.SQRT2;
}

/** cos ou sin de tπ/12 (t impair, non multiple de 3) sous la forme (u√6 + v√2)/4, u, v ∈ {−1 ; 1}. */
export interface ValeurDouzieme {
  u: number;
  v: number;
}

function douzieme(numerique: number): ValeurDouzieme {
  let meilleur = { u: 1, v: 1, ecart: Infinity };
  for (const u of [1, -1]) {
    for (const v of [1, -1]) {
      const ecart = Math.abs((u * Math.sqrt(6) + v * Math.SQRT2) / 4 - numerique);
      if (ecart < meilleur.ecart) meilleur = { u, v, ecart };
    }
  }
  return { u: meilleur.u, v: meilleur.v };
}

export function valeurDouziemeNumerique(x: ValeurDouzieme): number {
  return (x.u * Math.sqrt(6) + x.v * Math.SQRT2) / 4;
}

export function cosZ(e: ExerciceDeuxEcritures): ValeurDouzieme {
  return douzieme(Math.cos(angleNumerique(argumentZ(e))));
}

export function sinZ(e: ExerciceDeuxEcritures): ValeurDouzieme {
  return douzieme(Math.sin(angleNumerique(argumentZ(e))));
}

/** Contrôle de cohérence : les deux écritures de z coïncident (sert aux tests du générateur). */
export function ecrituresCoherentes(e: ExerciceDeuxEcritures): boolean {
  const z = formeAlgebrique(e);
  const r = moduleZNumerique(e);
  const th = angleNumerique(argumentZ(e));
  const ok = Math.abs(valeurR3(z.re) - r * Math.cos(th)) < 1e-9 && Math.abs(valeurR3(z.im) - r * Math.sin(th)) < 1e-9;
  const c = Math.abs(valeurDouziemeNumerique(cosZ(e)) - Math.cos(th)) < 1e-9 && Math.abs(valeurDouziemeNumerique(sinZ(e)) - Math.sin(th)) < 1e-9;
  return ok && c;
}
