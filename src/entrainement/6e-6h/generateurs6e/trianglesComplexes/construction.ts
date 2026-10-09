import type { PointComplexe, SommetTriangle } from "../../core6e/trianglesComplexes.types";
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

export const BANK_ISOCELES: TriangleIsoceleEntier[] = [
  { cote: 5, base: 6, hauteur: 4 },
  { cote: 5, base: 8, hauteur: 3 },
  { cote: 10, base: 12, hauteur: 8 },
  { cote: 10, base: 16, hauteur: 6 },
  { cote: 13, base: 10, hauteur: 12 },
  { cote: 13, base: 24, hauteur: 5 },
  { cote: 15, base: 18, hauteur: 12 },
  { cote: 15, base: 24, hauteur: 9 },
  { cote: 17, base: 16, hauteur: 15 },
  { cote: 20, base: 32, hauteur: 12 },
  { cote: 25, base: 14, hauteur: 24 },
  { cote: 25, base: 40, hauteur: 15 },
  { cote: 25, base: 48, hauteur: 7 },
];

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
