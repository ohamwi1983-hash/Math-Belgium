import type { Ensemble } from "../moteur5e/ensemblesReels";
import { intervalle, priveDe, R } from "../moteur5e/ensemblesReels";

/**
 * Couche core — `5gen60` « Composée en un point » (5e ch. 1, § 2, processus 2 APPLIQUER). Deux
 * fonctions simples f et g sont données ; on demande (f∘g)(a) OU (g∘f)(a) (ordre tiré) :
 * 1. la fonction appliquée d'abord et la valeur intermédiaire ;
 * 2. la valeur intermédiaire est-elle dans le domaine de la seconde fonction ? (VERDICT, choix
 *    fermé ; « n'existe pas » ≈ 40 %) ;
 * 3. la valeur exacte de la composée (seulement si elle existe).
 *
 * VARIANTE = famille de la fonction EXTÉRIEURE (celle qui s'applique en second), toujours à domaine
 * restreint : racine √(px + q), inverse c/(x − p), racine au dénominateur c/√(px + q). Le nom de la
 * variante ne dit jamais le verdict (les deux issues existent dans chaque variante).
 */

export type VarianteComposeePoint = "racine" | "inverse" | "racineDen";
export type Ordre = "fg" | "gf";

/** Fonction extérieure (domaine restreint). `s` = signe de x sous la racine (1 : x − p, −1 : p − x ;
 * k : coefficient de x, 1, 2 ou 3, seulement quand s = 1). */
export type FonctionExterieure =
  | { genre: "racine"; k: number; s: 1 | -1; p: number }
  | { genre: "inverse"; c: number; p: number }
  | { genre: "racineDen"; c: number; s: 1 | -1; p: number };

/** Fonction intérieure (toujours définie en a). */
export type FonctionInterieure =
  | { genre: "affine"; m: number; b: number }
  | { genre: "carre"; s: 1 | -1; b: number }
  | { genre: "abs"; p: number; b: number }
  | { genre: "racine"; p: number };

export interface ExerciceComposeePoint {
  variante: VarianteComposeePoint;
  ordre: Ordre;
  ext: FonctionExterieure;
  int: FonctionInterieure;
  a: number;
  /** Valeur intermédiaire (entière) : int(a). */
  m: number;
  existe: boolean;
}

/** Radicande de la fonction extérieure en x : k·x − p·k… écrit sous forme kx + q. */
export function radicande(ext: Extract<FonctionExterieure, { s: 1 | -1 }> | FonctionExterieure, x: number): number {
  if (ext.genre === "inverse") return x - ext.p;
  if (ext.genre === "racine") return ext.s === 1 ? ext.k * x - ext.k * ext.p : ext.p - x;
  return ext.s === 1 ? x - ext.p : ext.p - x;
}

export function valeurExt(ext: FonctionExterieure, x: number): number | null {
  const r = radicande(ext, x);
  if (ext.genre === "racine") return r < 0 ? null : Math.sqrt(r);
  if (ext.genre === "inverse") return r === 0 ? null : ext.c / r;
  return r <= 0 ? null : ext.c / Math.sqrt(r);
}

export function valeurInt(f: FonctionInterieure, x: number): number | null {
  switch (f.genre) {
    case "affine":
      return f.m * x + f.b;
    case "carre":
      return f.s * x * x + f.b;
    case "abs":
      return Math.abs(x - f.p) + f.b;
    case "racine":
      return x + f.p < 0 ? null : Math.sqrt(x + f.p);
  }
}

/** Domaine de la fonction extérieure. */
export function domaineExt(ext: FonctionExterieure): Ensemble {
  if (ext.genre === "inverse") return priveDe(R, [ext.p]);
  const ferme = ext.genre === "racine";
  return ext.s === 1 ? [intervalle(ext.p, ferme, Infinity, false)] : [intervalle(-Infinity, false, ext.p, ferme)];
}

export function domaineInt(f: FonctionInterieure): Ensemble {
  return f.genre === "racine" ? [intervalle(-f.p, true, Infinity, false)] : R;
}

/** Noms : la fonction extérieure s'appelle f pour (f∘g)(a), g pour (g∘f)(a). */
export const nomExt = (e: ExerciceComposeePoint): "f" | "g" => (e.ordre === "fg" ? "f" : "g");
export const nomInt = (e: ExerciceComposeePoint): "f" | "g" => (e.ordre === "fg" ? "g" : "f");

/** Valeur de la composée demandée (null : n'existe pas). */
export function valeurComposee(e: ExerciceComposeePoint): number | null {
  const m = valeurInt(e.int, e.a);
  return m === null ? null : valeurExt(e.ext, m);
}

/** Valeur obtenue en inversant l'ordre (extérieure d'abord) — piège ciblé. */
export function valeurOrdreInverse(e: ExerciceComposeePoint): number | null {
  const u = valeurExt(e.ext, e.a);
  return u === null ? null : valeurInt(e.int, u);
}

/** Valeur exacte c/√n ou √n : forme réduite (coefficient entier, radicande sans carré). */
export interface RacineReduite {
  /** Valeur = num · √rad / den (rad = 1 : rationnel). */
  num: number;
  rad: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** √n = c√r (r sans facteur carré). */
export function extraireCarre(n: number): { c: number; r: number } {
  let c = 1;
  let r = n;
  for (let k = 2; k * k <= r; k++) {
    while (r % (k * k) === 0) {
      r /= k * k;
      c *= k;
    }
  }
  return { c, r };
}

export function reduire(num: number, rad: number, den: number): RacineReduite {
  const { c, r } = extraireCarre(rad);
  let n = num * c;
  let d = den;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  return { num: n / g, rad: r, den: d / g };
}

/** Forme exacte de la composée : √R (racine), c/R (inverse), c/√R = c√R/R (racine au dénominateur). */
export function valeurExacte(e: ExerciceComposeePoint): RacineReduite | null {
  if (!e.existe) return null;
  const r = radicande(e.ext, e.m);
  if (e.ext.genre === "racine") return reduire(1, r, 1);
  if (e.ext.genre === "inverse") return reduire(e.ext.c, 1, r);
  const { c, r: rr } = extraireCarre(r);
  // c/(k√r) = c√r/(k·r)
  return reduire(e.ext.c, rr, c * rr);
}
