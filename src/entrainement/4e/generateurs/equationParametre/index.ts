import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceEquationParametre, VarianteEquationParametre } from "../../core/equationParametre.types";
import { choisir, entierAlea, type Poly2 } from "../../moteur/algebreTransfertSecondDegre";

/**
 * Générateur de gen115. Recherche au hasard de coefficients affines en m tels que Δ(m) ait deux
 * racines ENTIÈRES distinctes (|m| ≤ 10) et que la racine double de (E) en m₁ et en m₂ soit un
 * rationnel lisible (dénominateur ≤ 6). En `a-egal-m`, Δ(0) = b(0)² > 0 : m = 0 tombe dans la zone
 * « deux solutions », où l'équation n'est pourtant plus du second degré (une seule solution).
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "b-egal-m", label: "b = m (comme l'exemple du cours)" },
  { id: "affine", label: "b et c dépendent de m" },
  { id: "a-egal-m", label: "a = m (cas m = 0 du premier degré)" },
];

type Affine = [number, number];

export function valeur([k, c]: Affine, m: number): number {
  return k * m + c;
}

/** Δ(m) = b(m)² − 4 a(m) c(m), développé. */
export function deltaDe(a: Affine, b: Affine, c: Affine): Poly2 {
  const [a1, a0] = a;
  const [b1, b0] = b;
  const [c1, c0] = c;
  return [b1 * b1 - 4 * a1 * c1, 2 * b1 * b0 - 4 * (a1 * c0 + a0 * c1), b0 * b0 - 4 * a0 * c0];
}

function lisible(v: number): boolean {
  return [1, 2, 3, 4, 5, 6].some((d) => Math.abs(v * d - Math.round(v * d)) < 1e-9) && Math.abs(v) <= 12;
}

function racinesEntieres([L, M, N]: Poly2): [number, number] | null {
  if (L === 0) return null;
  const d = M * M - 4 * L * N;
  if (d <= 0) return null;
  const r = Math.round(Math.sqrt(d));
  if (r * r !== d) return null;
  const m1 = (-M - r) / (2 * L);
  const m2 = (-M + r) / (2 * L);
  if (!Number.isInteger(m1) || !Number.isInteger(m2)) return null;
  const [p, g] = m1 < m2 ? [m1, m2] : [m2, m1];
  if (Math.abs(p) > 12 || Math.abs(g) > 12) return null;
  return [p + 0, g + 0];
}

export function racineDouble(e: Pick<ExerciceEquationParametre, "a" | "b">, m: number): number {
  return -valeur(e.b, m) / (2 * valeur(e.a, m));
}

export function construireAvecVariante(id: string): ExerciceEquationParametre {
  const variante = id as VarianteEquationParametre;
  for (let essai = 0; essai < 20000; essai++) {
    let a: Affine, b: Affine, c: Affine;
    if (variante === "b-egal-m") {
      const a0 = choisir([1, 1, 2, 3, 4, -1, -2, -3, -4]);
      const c0 = Math.sign(a0) * entierAlea(1, 16);
      a = [0, a0];
      b = [1, 0];
      c = [0, c0];
    } else if (variante === "affine") {
      a = [0, choisir([1, 1, 2, -1])];
      b = [choisir([1, 2, -1, -2]), entierAlea(-6, 6)];
      c = [entierAlea(-3, 3), entierAlea(-9, 9)];
      if (c[0] === 0 && b[1] === 0) continue;
    } else {
      a = [1, 0];
      b = [entierAlea(-3, 3), entierAlea(-5, 5)];
      c = [entierAlea(-3, 3), entierAlea(-6, 6)];
      if (b[1] === 0 || (b[0] === 0 && c[0] === 0)) continue;
    }
    const delta = deltaDe(a, b, c);
    const r = racinesEntieres(delta);
    if (!r) continue;
    const [m1, m2] = r;
    if (variante === "a-egal-m" && (m1 === 0 || m2 === 0)) continue;
    if (valeur(a, m1) === 0 || valeur(a, m2) === 0) continue;
    const e = { variante, a, b, c, delta, m1, m2 };
    if (!lisible(racineDouble(e, m1)) || !lisible(racineDouble(e, m2))) continue;
    if (variante === "a-egal-m" && !lisible(-c[1] / b[1])) continue;
    return e;
  }
  throw new Error(`gen115 ${variante} : aucun tirage`);
}

export function genererExerciceEquationParametre(): ExerciceEquationParametre {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}

/** Ensemble des m pour lesquels Δ(m) > 0 (deux intervalles si L > 0, un intervalle si L < 0). */
export function deltaPositifALExterieur(e: ExerciceEquationParametre): boolean {
  return e.delta[0] > 0;
}
