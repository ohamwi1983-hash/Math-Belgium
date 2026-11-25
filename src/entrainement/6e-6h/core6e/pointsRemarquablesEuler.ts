import type { D, P } from "../ui6e/outilsLieuxLotH1";
import { choisir, droiteEntiere, droiteNormale, milieu, vec } from "../ui6e/outilsLieuxLotH1";

/**
 * Couche A — modèle de `6gen124` « Points remarquables et droite d'Euler » (6e ch. 9, § 1, Appliquer).
 * Triangle à sommets entiers choisi À REBOURS : trois points entiers d'un cercle de centre O entier
 * (rayon² 25, 50, 65 ou 85), avec A + B + C ≡ 3·O (mod 3) — G, O et H = A + B + C − 2·O sont entiers,
 * N (milieu de [OH]) au pire demi-entier ; triangle rectangle : G garde des tiers (voir le tirage). Type du triangle (acutangle, obtusangle, rectangle) = variante :
 * il se lit sur les données, il n'est pas un verdict. Six écrans : G, médiatrice de [AB] (forme
 * implicite), O, hauteur issue de C, H, N.
 */

export type Variante124 = "aigu" | "obtus" | "rectangle";
export type Phase124 = "G" | "mediatrice" | "O" | "hauteur" | "H" | "N";
export const PHASES_124: Phase124[] = ["G", "mediatrice", "O", "hauteur", "H", "N"];

export interface Exercice124 {
  variante: Variante124;
  A: P;
  B: P;
  C: P;
  O: P;
  /** Rayon² du cercle circonscrit. */
  R2: number;
}

const RAYONS2 = [25, 50, 65, 85];

function pointsDuCercle(R2: number): P[] {
  const pts: P[] = [];
  const r = Math.ceil(Math.sqrt(R2));
  for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) if (x * x + y * y === R2) pts.push({ x, y });
  return pts;
}

const produit = (u: P, v: P) => u.x * v.x + u.y * v.y;

/** Type du triangle par le signe des produits (côtés issus de chaque sommet). */
function typeTriangle(A: P, B: P, C: P): Variante124 {
  const s = [produit(vec(A, B), vec(A, C)), produit(vec(B, A), vec(B, C)), produit(vec(C, A), vec(C, B))];
  if (s.some((v) => v === 0)) return "rectangle";
  return s.some((v) => v < 0) ? "obtus" : "aigu";
}

export function tirer124(variante: Variante124): Exercice124 {
  for (;;) {
    const R2 = choisir(RAYONS2);
    const pts = pointsDuCercle(R2);
    const O = { x: Math.floor(Math.random() * 5) - 2, y: Math.floor(Math.random() * 5) - 2 };
    const i = Math.floor(Math.random() * pts.length);
    const j = Math.floor(Math.random() * pts.length);
    const k = Math.floor(Math.random() * pts.length);
    if (i === j || j === k || i === k) continue;
    const [a, b, c] = [pts[i]!, pts[j]!, pts[k]!];
    // Somme des vecteurs O→sommet divisible par 3 : G entier.
    const sx = a.x + b.x + c.x;
    const sy = a.y + b.y + c.y;
    // (Impossible pour un triangle rectangle inscrit : l'hypoténuse est un diamètre, la somme vaut le
    // vecteur du troisième sommet, jamais divisible par 3 sur ces cercles — G y garde des tiers.)
    if (variante !== "rectangle" && (sx % 3 !== 0 || sy % 3 !== 0)) continue;
    // H = O + somme : pas confondu avec O (impossible sur le quadrillage, sauf somme nulle).
    if (sx === 0 && sy === 0) continue;
    const A0 = { x: O.x + a.x, y: O.y + a.y };
    const B0 = { x: O.x + b.x, y: O.y + b.y };
    const C0 = { x: O.x + c.x, y: O.y + c.y };
    const type = typeTriangle(A0, B0, C0);
    if (type !== variante) continue;
    // Triangle pas trop aplati (aire ≥ 12), H dans une fenêtre raisonnable.
    const aire2 = Math.abs((B0.x - A0.x) * (C0.y - A0.y) - (C0.x - A0.x) * (B0.y - A0.y));
    if (aire2 < 24) continue;
    const H = { x: O.x + sx, y: O.y + sy };
    const xs = [A0.x, B0.x, C0.x, H.x, O.x];
    const ys = [A0.y, B0.y, C0.y, H.y, O.y];
    if (Math.max(...xs) - Math.min(...xs) > 18 || Math.max(...ys) - Math.min(...ys) > 18) continue;
    // Rectangle : angle droit en C (la hauteur issue de C est alors perpendiculaire à l'hypoténuse).
    let [A, B, C] = [A0, B0, C0];
    if (variante === "rectangle") {
      const enC = produit(vec(C, A), vec(C, B)) === 0;
      const enA = produit(vec(A, B), vec(A, C)) === 0;
      [A, B, C] = enC ? [A0, B0, C0] : enA ? [B0, C0, A0] : [C0, A0, B0];
    }
    // Ni (AB) horizontale ni verticale à la fois pour la médiatrice et la hauteur : on garde la variété,
    // mais la médiatrice de [AB] n'est jamais une droite des axes (x = 0 ou y = 0 : trop directe).
    // Pas isocèle en C : la hauteur issue de C serait la médiatrice de [AB] (deux écrans identiques).
    if ((C.x - A.x) ** 2 + (C.y - A.y) ** 2 === (C.x - B.x) ** 2 + (C.y - B.y) ** 2) continue;
    const m = milieu(A, B);
    if ((A.y === B.y && m.x === 0) || (A.x === B.x && m.y === 0)) continue;
    return { variante, A, B, C, O, R2 };
  }
}

// ---------------------------------------------------------------------------------------------
// Objets remarquables (exacts)
// ---------------------------------------------------------------------------------------------

export const G124 = (e: Exercice124): P => ({ x: (e.A.x + e.B.x + e.C.x) / 3, y: (e.A.y + e.B.y + e.C.y) / 3 });
export const H124 = (e: Exercice124): P => ({ x: e.A.x + e.B.x + e.C.x - 2 * e.O.x, y: e.A.y + e.B.y + e.C.y - 2 * e.O.y });
export const N124 = (e: Exercice124): P => milieu(e.O, H124(e));
/** Médiatrice d'un segment [UV]. */
export const mediatrice = (U: P, V: P): D => droiteEntiere(droiteNormale(milieu(U, V), vec(U, V)));
/** Hauteur issue de S, perpendiculaire à (UV). */
export const hauteur = (S: P, U: P, V: P): D => droiteEntiere(droiteNormale(S, vec(U, V)));
export const mediatriceAB = (e: Exercice124) => mediatrice(e.A, e.B);
export const mediatriceBC = (e: Exercice124) => mediatrice(e.B, e.C);
export const hauteurC = (e: Exercice124) => hauteur(e.C, e.A, e.B);
export const hauteurA = (e: Exercice124) => hauteur(e.A, e.B, e.C);
