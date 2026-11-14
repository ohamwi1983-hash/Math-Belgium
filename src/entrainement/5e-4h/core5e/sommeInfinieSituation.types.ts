/**
 * Couche A (5e) — types et calculs EXACTS de `5gen48` « Somme infinie en situation » (chapitre 3 de
 * 5e « Suites », section `convergence`, processus 3 TRANSFÉRER). Quatre familles :
 * - `periodique` : nombre décimal périodique (0,272727…, 1,2333…, 0,41515…) → fraction irréductible ;
 * - `rebonds` : balle lâchée d'une hauteur h, chaque rebond la ramène à p % de la hauteur de chute :
 *   distance totale = h + 2 × (somme des remontées) ;
 * - `zenon` : la poursuite d'Achille et de la tortue (ou d'un chien et de son maître, d'un cycliste et
 *   d'un piéton) découpée en étapes à la manière de Zénon : à chaque étape, le poursuivant parcourt la
 *   distance qui reste jusqu'à l'endroit où était le poursuivi, qui avance pendant ce temps de la
 *   moitié, du tiers… de cette distance ;
 * - `figures` : figures emboîtées AUTRES que les carrés de 5gen17 — triangles des milieux (triangle
 *   central colorié, on recommence dans le triangle du haut) ou hexagones des milieux (une couronne
 *   sur deux coloriée).
 *
 * Toutes les grandeurs sont des fractions EXACTES (`Frac`) : ces fonctions sont la SOURCE UNIQUE des
 * valeurs (générateur, vérification, textes, corrigé papier). Raison toujours 0 < q < 1.
 */

export type IdVarianteSommeInfinie = "periodique" | "rebonds" | "zenon" | "figures";

/** Fraction irréductible, dénominateur > 0. */
export interface Frac {
  num: number;
  den: number;
}

export interface ExercicePeriodique {
  variante: "periodique";
  /** `pur` : la période commence juste après la virgule ; `mixte` : un chiffre ne se répète pas. */
  sousCas: "pur" | "mixte";
  /** Partie entière (0 à 3). */
  entier: number;
  /** Chiffres après la virgule qui ne se répètent pas (« » pour `pur`). */
  avant: string;
  /** Bloc de chiffres qui se répète indéfiniment. */
  periode: string;
}

export interface ExerciceRebonds {
  variante: "rebonds";
  objet: "balle" | "ballon" | "bille";
  /** Hauteur de chute initiale, dans l'unité `unite`. */
  hauteur: number;
  unite: "cm" | "m";
  /** Pourcentage de remontée (0 < p < 100). */
  pourcent: number;
}

export interface ExerciceZenon {
  variante: "zenon";
  contexte: "achille" | "chien" | "cycliste";
  /** Avance initiale du poursuivi, en mètres. */
  avance: number;
  /** Le poursuivant va k fois plus vite que le poursuivi. */
  k: number;
}

export interface ExerciceFigures {
  variante: "figures";
  sousCas: "triangle" | "hexagones";
  /** Aire de la figure de départ, en cm². */
  aire: number;
}

export type ExerciceSommeInfinie = ExercicePeriodique | ExerciceRebonds | ExerciceZenon | ExerciceFigures;

// ============================================================================
// Fractions exactes.
// ============================================================================

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function frac(num: number, den = 1): Frac {
  if (den === 0) throw new Error("frac : dénominateur nul");
  const s = den < 0 ? -1 : 1;
  const g = pgcd(num, den);
  return { num: (s * num) / g, den: (s * den) / g };
}

export const plus = (a: Frac, b: Frac): Frac => frac(a.num * b.den + b.num * a.den, a.den * b.den);
export const moins = (a: Frac, b: Frac): Frac => frac(a.num * b.den - b.num * a.den, a.den * b.den);
export const fois = (a: Frac, b: Frac): Frac => frac(a.num * b.num, a.den * b.den);
export const divise = (a: Frac, b: Frac): Frac => frac(a.num * b.den, a.den * b.num);
export const valeur = (a: Frac): number => a.num / a.den;
export const UN: Frac = { num: 1, den: 1 };

/** Vrai si la fraction s'écrit avec au plus `decimales` chiffres après la virgule. */
export function estDecimalCourt(a: Frac, decimales = 4): boolean {
  return (10 ** decimales) % a.den === 0;
}

// ============================================================================
// Données de chaque famille : premier terme, raison, somme infinie, réponse.
// ============================================================================

export interface DonneesSomme {
  u1: Frac;
  q: Frac;
  /** Deuxième terme (aide « q = u₂/u₁ »). */
  u2: Frac;
  sInfini: Frac;
  /** Réponse au problème (fraction irréductible, distance, aire…). */
  reponse: Frac;
}

/** Partie qui ne se répète pas : entier + 0,avant. */
export function partieFixe(e: ExercicePeriodique): Frac {
  return plus(frac(e.entier), e.avant ? frac(Number(e.avant), 10 ** e.avant.length) : frac(0));
}

export function donnees(e: ExerciceSommeInfinie): DonneesSomme {
  let u1: Frac;
  let q: Frac;
  switch (e.variante) {
    case "periodique":
      u1 = frac(Number(e.periode), 10 ** (e.avant.length + e.periode.length));
      q = frac(1, 10 ** e.periode.length);
      break;
    case "rebonds":
      q = frac(e.pourcent, 100);
      u1 = fois(frac(e.hauteur), q);
      break;
    case "zenon":
      q = frac(1, e.k);
      u1 = frac(e.avance, e.k);
      break;
    case "figures":
      u1 = frac(e.aire, 4);
      q = e.sousCas === "triangle" ? frac(1, 4) : frac(9, 16);
      break;
  }
  const sInfini = divise(u1, moins(UN, q));
  let reponse: Frac;
  switch (e.variante) {
    case "periodique":
      reponse = plus(partieFixe(e), sInfini);
      break;
    case "rebonds":
      reponse = plus(frac(e.hauteur), fois(frac(2), sInfini));
      break;
    case "zenon":
      reponse = plus(frac(e.avance), sInfini);
      break;
    case "figures":
      reponse = moins(frac(e.aire), sInfini);
      break;
  }
  return { u1, q, u2: fois(u1, q), sInfini, reponse };
}

/** Unité des longueurs/aires du contexte (« » pour un nombre périodique). */
export function unite(e: ExerciceSommeInfinie): string {
  switch (e.variante) {
    case "periodique":
      return "";
    case "rebonds":
      return e.unite;
    case "zenon":
      return "m";
    case "figures":
      return "cm²";
  }
}

/** Écriture décimale affichée du nombre périodique : la période répétée jusqu'à ≥ 6 décimales. */
export function chiffresPeriodique(e: ExercicePeriodique): string {
  let dec = e.avant;
  while (dec.length < 6) dec += e.periode;
  return dec;
}
