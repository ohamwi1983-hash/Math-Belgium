/**
 * Couche A (5e) — types et calculs purs de `5gen46` « Trois termes consécutifs » (chapitre 3 de 5e
 * « Suites », section `suites-geometriques`, processus 2 APPLIQUER). Trois nombres a, b, c, qui
 * dépendent de x, doivent être (dans cet ordre) trois termes consécutifs d'une suite :
 * - `arithmetique` : 2b = a + c (b − a = c − b) ; expressions affines, ou avec des x² qui
 *   s'éliminent — l'équation réduite est toujours du premier degré, une seule solution ;
 * - `geometrique` : b² = a·c (b/a = c/b) ; expressions affines — l'équation réduite est du second
 *   degré (ou du premier si les x² s'éliminent) ; une solution qui annule un terme est ÉCARTÉE
 *   (on ne passe pas de 0 à un nombre non nul en multipliant, et la raison d'une suite géométrique
 *   n'est jamais nulle) — 0, 1 ou 2 valeurs de x conviennent.
 *
 * Ces fonctions sont la SOURCE UNIQUE des valeurs : générateur, vérification, textes, récapitulatif
 * et corrigé papier les appellent toutes. Toutes les racines sont ENTIÈRES (garanti par le
 * générateur), tous les termes aussi ; seule la raison q peut être une fraction.
 */

export type IdVarianteTroisTermes = "arithmetique" | "geometrique";

/** Polynôme de degré ≤ 2 : [constante, coefficient de x, coefficient de x²]. */
export type Poly = [number, number, number];

/** Relations proposées à l'écran « relation » (choix fermé). */
export type IdRelation = "2b=a+c" | "b2=ac" | "b=a+c" | "b=ac" | "2b=ac";

export const RELATIONS: IdRelation[] = ["2b=a+c", "b2=ac", "b=a+c", "b=ac", "2b=ac"];

export interface ExerciceTroisTermes {
  variante: IdVarianteTroisTermes;
  /** a, b, c (dans cet ordre). */
  termes: [Poly, Poly, Poly];
  /** Ordre d'affichage des relations à l'écran de choix (tiré avec l'instance). */
  ordreRelations: IdRelation[];
}

// ============================================================================
// Polynômes.
// ============================================================================

export function evaluerPoly(p: Poly, x: number): number {
  return p[0] + p[1] * x + p[2] * x * x;
}

export function degrePoly(p: Poly): number {
  if (p[2] !== 0) return 2;
  if (p[1] !== 0) return 1;
  return p[0] !== 0 ? 0 : -1;
}

function plus(p: Poly, q: Poly): Poly {
  return [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
}

export function fois(k: number, p: Poly): Poly {
  return [k * p[0] + 0, k * p[1] + 0, k * p[2] + 0];
}

/** Produit de deux polynômes de degré ≤ 1 (les termes géométriques sont affines). */
export function produitAffines(p: Poly, q: Poly): Poly {
  return [p[0] * q[0], p[0] * q[1] + p[1] * q[0], p[1] * q[1]];
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

// ============================================================================
// Fractions (raison q).
// ============================================================================

export interface Fraction {
  num: number;
  den: number;
}

export function fraction(num: number, den: number): Fraction {
  if (den === 0) throw new Error("fraction : dénominateur nul");
  const g = pgcd(num, den) || 1;
  const s = den < 0 ? -1 : 1;
  return { num: (s * num) / g + 0, den: (s * den) / g };
}

export function valeurFraction(f: Fraction): number {
  return f.num / f.den;
}

// ============================================================================
// Relation et équation réduite.
// ============================================================================

export function relationCorrecte(e: ExerciceTroisTermes): IdRelation {
  return e.variante === "arithmetique" ? "2b=a+c" : "b2=ac";
}

/** Membre de gauche brut de « relation ramenée à 0 » : 2b − a − c, ou b² − a·c. */
export function equationBrute(e: ExerciceTroisTermes): Poly {
  const [a, b, c] = e.termes;
  if (e.variante === "arithmetique") return plus(fois(2, b), fois(-1, plus(a, c)));
  return plus(produitAffines(b, b), fois(-1, produitAffines(a, c)));
}

/** Équation réduite affichée : divisée par le PGCD des coefficients, coefficient dominant positif. */
export function equationSimplifiee(e: ExerciceTroisTermes): Poly {
  const p = equationBrute(e);
  // « 0 = k » (termes en x éliminés) : gardée telle quelle, « 225 = 0 » se lit mieux que « 1 = 0 ».
  if (p[1] === 0 && p[2] === 0) return p;
  const g = pgcd(pgcd(p[0], p[1]), p[2]) || 1;
  const dominant = p[2] !== 0 ? p[2] : p[1] !== 0 ? p[1] : p[0];
  const s = dominant < 0 ? -1 : 1;
  // Division exacte (s·c)/g : multiplier par la fraction s/g laissait « 0.9999999999999999x » (49 × 1/49).
  return [(s * p[0]) / g + 0, (s * p[1]) / g + 0, (s * p[2]) / g + 0];
}

/** Membres développés de la relation (corrigé) : 2b et a + c, ou b² et a·c. */
export function membresDeveloppes(e: ExerciceTroisTermes): [Poly, Poly] {
  const [a, b, c] = e.termes;
  if (e.variante === "arithmetique") return [fois(2, b), plus(a, c)];
  return [produitAffines(b, b), produitAffines(a, c)];
}

// ============================================================================
// Résolution.
// ============================================================================

export type TypeResolution = "premier-degre" | "contradiction" | "delta-negatif" | "delta-nul" | "delta-positif";

export interface Resolution {
  type: TypeResolution;
  /** Discriminant de l'équation simplifiée (second degré seulement). */
  delta: number | null;
  /** Solutions de l'équation (entières), croissantes. */
  racines: number[];
}

export function resoudre(e: ExerciceTroisTermes): Resolution {
  const [c0, c1, c2] = equationSimplifiee(e);
  if (c2 === 0) {
    if (c1 === 0) return { type: "contradiction", delta: null, racines: [] };
    return { type: "premier-degre", delta: null, racines: [-c0 / c1 + 0] };
  }
  const delta = c1 * c1 - 4 * c2 * c0;
  if (delta < 0) return { type: "delta-negatif", delta, racines: [] };
  if (delta === 0) return { type: "delta-nul", delta, racines: [-c1 / (2 * c2) + 0] };
  const r = Math.sqrt(delta);
  return { type: "delta-positif", delta, racines: [(-c1 - r) / (2 * c2) + 0, (-c1 + r) / (2 * c2) + 0].sort((u, v) => u - v) };
}

/** Valeurs de a, b, c pour une valeur de x. */
export function termesEn(e: ExerciceTroisTermes, x: number): [number, number, number] {
  return e.termes.map((p) => evaluerPoly(p, x) + 0) as [number, number, number];
}

/** Une solution de l'équation convient-elle ? Arithmétique : toujours. Géométrique : aucun terme nul. */
export function solutionValable(e: ExerciceTroisTermes, x: number): boolean {
  if (e.variante === "arithmetique") return true;
  return termesEn(e, x).every((t) => t !== 0);
}

export interface Analyse {
  resolution: Resolution;
  /** Valeurs de x qui conviennent (croissantes). */
  valables: number[];
  /** Solutions de l'équation écartées (un terme nul). */
  ecartees: number[];
}

export function analyser(e: ExerciceTroisTermes): Analyse {
  const resolution = resoudre(e);
  return {
    resolution,
    valables: resolution.racines.filter((x) => solutionValable(e, x)),
    ecartees: resolution.racines.filter((x) => !solutionValable(e, x)),
  };
}

/** Raison de la suite pour une valeur de x qui convient : r = b − a, ou q = b/a. */
export function raisonEn(e: ExerciceTroisTermes, x: number): Fraction {
  const [a, b] = termesEn(e, x);
  return e.variante === "arithmetique" ? fraction(b - a, 1) : fraction(b, a);
}

/** Degré de l'équation réduite (1 ou 2 ; 0 pour une contradiction « 0 = k », du premier degré au départ). */
export function degreEquation(e: ExerciceTroisTermes): 1 | 2 {
  return equationSimplifiee(e)[2] !== 0 ? 2 : 1;
}

/** Arithmétique : une expression au moins contient x² (les x² s'éliminent). */
export function avecCarres(e: ExerciceTroisTermes): boolean {
  return e.termes.some((p) => p[2] !== 0);
}
