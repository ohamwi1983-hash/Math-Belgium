import type { ExerciceAssocierParaboles, ParaboleDonnee } from "../core/associerParaboles.types";
import { moinsH, plusQ, polynome, q } from "../ui/corrigeChapitre3";

/**
 * Modèle de gen128 « Associer paraboles et équations » : valeurs, zéros entiers, écritures LaTeX de
 * chaque équation dans SA forme, fenêtre commune (bornes entières, même échelle en x et en y).
 */

export const NOMS = ["f", "g", "h", "p"] as const;

export function valeur(p: ParaboleDonnee, x: number): number {
  return p.a * (x - p.h) * (x - p.h) + p.k;
}

/** Zéros entiers triés (vide si la parabole ne coupe pas l'axe des x). */
export function zerosEntiers(p: ParaboleDonnee): number[] {
  const r = -p.k / p.a;
  if (r < 0) return [];
  if (r === 0) return [p.h];
  const d = Math.sqrt(r);
  return [p.h - d, p.h + d];
}

/** Zéros réels, entiers ou non (contrôle). */
export function zerosReels(p: ParaboleDonnee): number[] {
  const r = -p.k / p.a;
  if (r < 0) return [];
  const d = Math.sqrt(r);
  return d === 0 ? [p.h] : [p.h - d, p.h + d];
}

export function ordonneeOrigine(p: ParaboleDonnee): number {
  return valeur(p, 0);
}

function coefDevant(a: number): string {
  return a === 1 ? "" : a === -1 ? "-" : q(a);
}

function facteur(r: number): string {
  return r === 0 ? "x" : `(${moinsH(r)})`;
}

/** Membre de droite de l'équation, dans la forme de la parabole. */
export function ecritureLatex(p: ParaboleDonnee): string {
  if (p.ecriture === "canonique") return `${coefDevant(p.a)}(${moinsH(p.h)})^2${plusQ(p.k)}`;
  if (p.ecriture === "factorisee") {
    const [r1, r2] = zerosEntiers(p) as [number, number];
    const [u, v] = r2 === 0 ? [r2, r1] : [r1, r2];
    return `${coefDevant(p.a)}${facteur(u)}${facteur(v)}`;
  }
  return polynome([p.a, -2 * p.a * p.h, p.a * p.h * p.h + p.k]);
}

export function equationNommee(e: ExerciceAssocierParaboles, i: number): string {
  return `${NOMS[i]}(x)=${ecritureLatex(e.paraboles[i]!)}`;
}

export interface FenetreParaboles {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Fenêtre commune : sommets ± 3 en x (axe des y compris), sommets et branches visibles en y. */
export function fenetre(e: { paraboles: ParaboleDonnee[] }): FenetreParaboles {
  const ps = e.paraboles;
  let xMin = Math.min(-1, ...ps.map((p) => p.h - 3), ...ps.flatMap((p) => zerosReels(p).map((z) => Math.floor(z) - 1)));
  let xMax = Math.max(1, ...ps.map((p) => p.h + 3), ...ps.flatMap((p) => zerosReels(p).map((z) => Math.ceil(z) + 1)));
  xMin = Math.floor(xMin);
  xMax = Math.ceil(xMax);
  const yMin = Math.min(-1, ...ps.map((p) => p.k - (p.a < 0 ? 4 : 1)));
  const yMax = Math.max(1, ...ps.map((p) => p.k + (p.a > 0 ? 4 : 1)));
  return { xMin, xMax, yMin, yMax };
}

/** Pas horizontal pour lire a sur la grille : 1, ou m quand |a| = 1/m (le point (x_S + m ; y_S + m²a)). */
export function pasLecture(p: ParaboleDonnee): number {
  const inv = 1 / Math.abs(p.a);
  return Number.isInteger(inv) && inv > 1 ? inv : 1;
}
