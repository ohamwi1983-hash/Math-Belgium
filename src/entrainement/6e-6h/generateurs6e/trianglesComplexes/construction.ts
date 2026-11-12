import type { Longueur, OrdresChoix, PointComplexe, SommetTriangle } from "../../core6e/trianglesComplexes.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — utilitaires de construction géométrique PARTAGÉS par les familles A et B de
 * `6gen41` (Couche A ↔ Couche A, réutilisation libre — CLAUDE.md). Tout point produit ici a des
 * coordonnées ENTIÈRES exactes — voir en-tête `core6e/trianglesComplexes.types.ts` pour la
 * justification "éviter les longueurs irrationnelles".
 *
 * ============================================================================
 * **Banque de triangles isocèles à 3 côtés entiers** — `BANK_ISOCELES`
 * ============================================================================
 * Chaque entrée {cote,base,hauteur} vérifie `hauteur² + (base/2)² = cote²` (une moitié de triangle
 * isocèle est un triangle rectangle, dérivé ici d'un triplet pythagoricien standard : ex. côté=5,
 * base=6 ⟹ moitié-base=3, hauteur=4, triplet 3-4-5). `base` TOUJOURS pair (moitié-base entière).
 *
 * **Preuve qu'un tel triangle n'est JAMAIS rectangle** : les 3 côtés sont {cote, cote, base}. Un
 * triangle est rectangle ssi une relation a²+b²=c² tient entre 2 de ses côtés pris comme "cathètes"
 * et le 3e comme "hypoténuse". Ici : `cote²+cote²=base²` impliquerait `base=cote·√2`, IRRATIONNEL
 * pour tout `cote` entier — jamais vrai pour une paire d'entiers. `cote²+base²=cote²` impliquerait
 * `base=0` — exclu (base>0 par construction). Donc aucune des 2 relations possibles ne peut jamais
 * tenir avec des entiers stricts : ce triangle isocèle est **structurellement, jamais rectangle**,
 * quel que soit le tirage dans la banque — vérifié aussi par test (`construction.test.ts`).
 */
export interface TriangleIsoceleEntier {
  cote: number;
  base: number;
  hauteur: number;
}

/** Triplets pythagoriciens de référence (c ≤ 30) — source des 2 banques ci-dessous. */
const TRIPLETS: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
  [12, 16, 20],
  [15, 20, 25],
  [7, 24, 25],
  [10, 24, 26],
  [20, 21, 29],
  [18, 24, 30],
];

/** Audit 6e ch. 5, point 45 (variété) : banque DÉRIVÉE des triplets — chaque triplet (a, b, c)
 * donne 2 isocèles (base 2a / hauteur b, et base 2b / hauteur a), soit 22 formes distinctes au lieu
 * de 13 écrites à la main. */
export const BANK_ISOCELES: TriangleIsoceleEntier[] = TRIPLETS.flatMap(([a, b, c]) => [
  { cote: c, base: 2 * a, hauteur: b },
  { cote: c, base: 2 * b, hauteur: a },
]);

/** Triplets pythagoriciens `a<b<c` (`a²+b²=c²`, `a≠b` — donc JAMAIS isocèle) — famille A sous-type
 * "rectangle", famille A garantit l'angle droit sans jamais introduire d'égalité de côtés. */
export interface TriangleRectangleEntier {
  a: number;
  b: number;
  c: number;
}

export const BANK_PYTHAGORE: TriangleRectangleEntier[] = [
  { a: 3, b: 4, c: 5 },
  { a: 6, b: 8, c: 10 },
  { a: 5, b: 12, c: 13 },
  { a: 8, b: 15, c: 17 },
  { a: 7, b: 24, c: 25 },
  { a: 9, b: 12, c: 15 },
  { a: 20, b: 21, c: 29 },
  { a: 12, b: 16, c: 20 },
  { a: 9, b: 40, c: 41 },
  { a: 12, b: 35, c: 37 },
];

export function tirerTriangleIsocele(): TriangleIsoceleEntier {
  return tirerParmi(BANK_ISOCELES);
}

export function tirerTriangleRectangle(): TriangleRectangleEntier {
  return tirerParmi(BANK_PYTHAGORE);
}

/** Neutralise `-0` (produit ex. par `-y` quand `y=0`) — même piège/fix que `normaliserZero` de
 * `moteur6e/expressionComplexe.ts` (structurellement `-0 !== 0` pour `Object.is`/`toEqual`, bien
 * que mathématiquement identique). */
function normaliserZero(v: number): number {
  return v === 0 ? 0 : v;
}

/** Rotation de `(x,y)` par `k×90°` (k∈{0,1,2,3}) — seule famille de rotations préservant des
 * coordonnées ENTIÈRES exactement (toute autre rotation introduirait un radical). */
export function rotation90(x: number, y: number, k: number): { x: number; y: number } {
  const kMod = ((k % 4) + 4) % 4;
  const { x: rx, y: ry } = (() => {
    switch (kMod) {
      case 0:
        return { x, y };
      case 1:
        return { x: -y, y: x };
      case 2:
        return { x: -x, y: -y };
      default:
        return { x: y, y: -x };
    }
  })();
  return { x: normaliserZero(rx), y: normaliserZero(ry) };
}

/** Translation entière aléatoire, petite amplitude — pure variété visuelle, sans jamais introduire
 * de radical (coordonnées entières préservées). */
export function tirerTranslation(): { tx: number; ty: number } {
  return { tx: tirerEntier(-4, 4), ty: tirerEntier(-4, 4) };
}

/** Assemble `re+im·i` en LaTeX depuis 2 entiers — signe+magnitude TOUJOURS ensemble (jamais de
 * signe orphelin, voir CLAUDE.md "Dangling sign"), même convention que `assembleAPlusBI` de
 * `ui6e/formatFormeTrigonometrique.ts` (6gen37) — réimpliquée ICI plutôt qu'importée (chaque
 * générateur reste indépendant, CLAUDE.md). */
export function pointEntierLatex(re: number, im: number): string {
  if (re === 0 && im === 0) return "0";
  const reTexte = re === 0 ? "" : `${re}`;
  if (im === 0) return reTexte;
  const imSigne = im < 0 ? "-" : "+";
  const imMagnitude = Math.abs(im) === 1 ? "" : `${Math.abs(im)}`;
  if (re === 0) return `${im < 0 ? "-" : ""}${imMagnitude}i`;
  return `${reTexte}${imSigne}${imMagnitude}i`;
}

export function pointEntier(re: number, im: number): PointComplexe {
  return { re, im, latex: pointEntierLatex(re, im) };
}

/** Attribue aléatoirement les 3 étiquettes A/B/C aux 3 rôles géométriques {special, autre1, autre2}
 * (ex. `special`=sommet isocèle/droit) — l'élève ne doit jamais pouvoir supposer "toujours en A". */
export function tirerEtiquettes(): { special: SommetTriangle; autre1: SommetTriangle; autre2: SommetTriangle } {
  const ordre = tirerParmi<[SommetTriangle, SommetTriangle, SommetTriangle]>([
    ["A", "B", "C"],
    ["A", "C", "B"],
    ["B", "A", "C"],
    ["B", "C", "A"],
    ["C", "A", "B"],
    ["C", "B", "A"],
  ]);
  return { special: ordre[0], autre1: ordre[1], autre2: ordre[2] };
}


// ============================================================================
// Audit 6e ch. 5 (lot D) — longueurs exactes, permutations d'options.
// ============================================================================

/** √n simplifié en LaTeX (n entier ≥ 0) : 25 → 5, 8 → 2\\sqrt{2}, 10 → \\sqrt{10}. */
export function racineLatex(n: number): string {
  if (n === 0) return "0";
  let k = 1;
  let m = n;
  for (let d = 2; d * d <= m; d++) {
    while (m % (d * d) === 0) {
      m /= d * d;
      k *= d;
    }
  }
  if (m === 1) return `${k}`;
  return k === 1 ? `\\sqrt{${m}}` : `${k}\\sqrt{${m}}`;
}

/** Carré de la distance entre 2 points à coordonnées ENTIÈRES — entier exact. */
export function distanceCarree(p: { re: number; im: number }, q: { re: number; im: number }): number {
  return (p.re - q.re) ** 2 + (p.im - q.im) ** 2;
}

/** Longueur exacte entre 2 points entiers : √(carré) simplifié. */
export function longueurEntre(p: { re: number; im: number }, q: { re: number; im: number }): Longueur {
  const d2 = distanceCarree(p, q);
  return { numerique: Math.sqrt(d2), latex: racineLatex(d2) };
}

/** Permutation uniforme (Fisher–Yates) de 0..n−1. */
export function tirerPermutation(n: number): number[] {
  const ordre = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
  }
  return ordre;
}

/** 2 permutations indépendantes (une par écran de choix). Sur un écran à m < 4 options, l'ordre
 * relatif des indices 0..m−1 d'une permutation uniforme de 4 reste uniforme. */
export function tirerOrdres(): OrdresChoix {
  return [tirerPermutation(4), tirerPermutation(4)];
}

/** Angle (en degrés) au sommet `s` du triangle (s, p, q) — produit scalaire, coordonnées réelles. */
export function angleAuSommetDeg(s: { re: number; im: number }, p: { re: number; im: number }, q: { re: number; im: number }): number {
  const ux = p.re - s.re;
  const uy = p.im - s.im;
  const vx = q.re - s.re;
  const vy = q.im - s.im;
  const cos = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}
