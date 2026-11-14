/**
 * Couche A (5e) — types et calculs purs de `5gen45` « Sommes de termes consécutifs » (chapitre 3
 * de 5e « Suites », section `suites-geometriques`, processus 2 APPLIQUER). Quatre variantes :
 * - `arith-indices` : suite arithmétique donnée (formule uₙ = an + b, ou u₁ et r), somme de uₚ à uₙ ;
 * - `arith-extension` : somme écrite en extension (7 + 11 + … + 203), somme des nombres impairs
 *   (ou pairs) jusqu'à un nombre donné, somme des multiples de d compris entre deux bornes ;
 * - `geom-indices` : suite géométrique donnée (u₁ et q, ou formule), somme de uₚ à uₙ ;
 * - `geom-extension` : somme écrite en extension (3 + 6 + 12 + … + 3072).
 *
 * Tous les termes sont ENTIERS (même avec q = 1/2 : le premier terme est alors un multiple de la
 * bonne puissance de 2), toutes les réponses sont exactes et faisables sans calculatrice. Ces
 * fonctions sont la SOURCE UNIQUE des valeurs : générateur, vérification, textes et corrigé papier
 * les appellent toutes.
 */

export type IdVarianteSommesTermes = "arith-indices" | "arith-extension" | "geom-indices" | "geom-extension";

/** Raison géométrique q = num/den (den = 1 ou 2, fraction irréductible). */
export interface RaisonQ {
  num: number;
  den: number;
}

export interface ExerciceArithIndices {
  variante: "arith-indices";
  /** `formule` : uₙ = a·n + b donné ; `u1r` : premier terme et raison donnés. */
  donnee: "formule" | "u1r";
  u1: number;
  r: number;
  /** Premier et dernier rang de la somme (uₚ + … + uₙ), 3 ≤ p < n. */
  p: number;
  n: number;
}

export interface ExerciceArithExtension {
  variante: "arith-extension";
  /** `liste` : a + (a + r) + … + dernier ; `naturels` : impairs de 1 à 2k − 1 ou pairs de 2 à 2k ;
   * `multiples` : multiples de d compris entre deux bornes (bornes jamais multiples de d). */
  sousCas: "liste" | "naturels" | "multiples";
  /** Premier terme, raison et nombre de termes de la somme. */
  premier: number;
  r: number;
  nombre: number;
  /** `naturels` : parité des nombres additionnés. */
  parite: "impairs" | "pairs" | null;
  /** `multiples` : bornes de l'intervalle (le diviseur est `r`). */
  bornes: [number, number] | null;
}

export interface ExerciceGeomIndices {
  variante: "geom-indices";
  /** `u1q` : premier terme et raison donnés ; `formule` : uₙ = k·q^(n−1) ou uₙ = k·qⁿ. */
  donnee: "u1q" | "formule";
  /** Formule donnée avec l'exposant n − 1 (`n-1`) ou n (`n`) ; `null` si `donnee = u1q`. */
  exposant: "n-1" | "n" | null;
  u1: number;
  q: RaisonQ;
  p: number;
  n: number;
}

export interface ExerciceGeomExtension {
  variante: "geom-extension";
  premier: number;
  q: RaisonQ;
  nombre: number;
}

export type ExerciceSommesTermes = ExerciceArithIndices | ExerciceArithExtension | ExerciceGeomIndices | ExerciceGeomExtension;

// ============================================================================
// Calculs (entiers exacts).
// ============================================================================

/** Terme de rang k d'une suite arithmétique. */
export function termeArith(u1: number, r: number, k: number): number {
  return u1 + (k - 1) * r;
}

/** Terme de rang k d'une suite géométrique à termes entiers (multiplication exacte pas à pas). */
export function termeGeom(u1: number, q: RaisonQ, k: number): number {
  let t = u1;
  for (let i = 1; i < k; i++) t = (t * q.num) / q.den;
  return t;
}

/** Valeur de q (nombre). */
export function valeurQ(q: RaisonQ): number {
  return q.num / q.den;
}

export function estFraction(q: RaisonQ): boolean {
  return q.den !== 1;
}

/** Somme de N termes consécutifs d'une suite géométrique à partir de `premier` (addition exacte). */
export function sommeGeom(premier: number, q: RaisonQ, nombre: number): number {
  let s = 0;
  let t = premier;
  for (let i = 0; i < nombre; i++) {
    s += t;
    t = (t * q.num) / q.den;
  }
  return s;
}

/** Données utiles d'une instance : nombre de termes N, premier et dernier terme de la somme, raison
 * (r ou q), somme S. */
export interface DonneesSomme {
  nombre: number;
  premier: number;
  dernier: number;
  somme: number;
}

export function donneesSomme(e: ExerciceSommesTermes): DonneesSomme {
  switch (e.variante) {
    case "arith-indices": {
      const nombre = e.n - e.p + 1;
      const premier = termeArith(e.u1, e.r, e.p);
      const dernier = termeArith(e.u1, e.r, e.n);
      return { nombre, premier, dernier, somme: (nombre * (premier + dernier)) / 2 };
    }
    case "arith-extension": {
      const dernier = termeArith(e.premier, e.r, e.nombre);
      return { nombre: e.nombre, premier: e.premier, dernier, somme: (e.nombre * (e.premier + dernier)) / 2 };
    }
    case "geom-indices": {
      const nombre = e.n - e.p + 1;
      const premier = termeGeom(e.u1, e.q, e.p);
      return { nombre, premier, dernier: termeGeom(e.u1, e.q, e.n), somme: sommeGeom(premier, e.q, nombre) };
    }
    case "geom-extension":
      return { nombre: e.nombre, premier: e.premier, dernier: termeGeom(e.premier, e.q, e.nombre), somme: sommeGeom(e.premier, e.q, e.nombre) };
  }
}

/** Multiples : facteurs k₁ et k₂ du premier et du dernier multiple (premier = d·k₁, dernier = d·k₂). */
export function facteursMultiples(e: ExerciceArithExtension): [number, number] {
  return [e.premier / e.r, termeArith(e.premier, e.r, e.nombre) / e.r];
}

/** Indice de rang à partir duquel la formule `k·qⁿ` démarre : coefficient k de la formule affichée. */
export function coefficientFormuleGeom(e: ExerciceGeomIndices): number {
  // uₙ = k·qⁿ ⇒ u₁ = k·q ⇒ k = u₁ / q.
  return e.exposant === "n" ? (e.u1 * e.q.den) / e.q.num : e.u1;
}

/** Formule arithmétique uₙ = a·n + b : a = r, b = u₁ − r. */
export function coefficientsFormuleArith(e: ExerciceArithIndices): { a: number; b: number } {
  return { a: e.r, b: e.u1 - e.r };
}
