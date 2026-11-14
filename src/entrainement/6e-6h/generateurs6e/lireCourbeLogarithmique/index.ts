import type { BaseLog, CourbeLog, ExerciceAssocierCourbesLog, ExerciceLectureCourbeLog, ExerciceLireCourbeLogarithmique, VarianteLireCourbeLogarithmique } from "../../core6e/lireCourbeLogarithmique.types";
import { entierBase, estCroissante } from "../../ui6e/formatLireCourbeLogarithmique";

/**
 * Couche A (6e) — générateur de `6gen85` « Lire une courbe logarithmique ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts`) rejoue exactement le même tirage, dans
 * l'appli comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * - `lecture` : sens de variation tiré d'abord (a > 1 ou 0 < a < 1, une chance sur deux), puis la base
 *   (2, 3, 4, 5, 10 ou 1/2, 1/3, 1/4), c et d uniformes dans {−3, …, 3}. Base 10 : le point qui donne
 *   la base est en x = c + 10, la fenêtre reste lisible (au plus 15 unités de large).
 * - `associer` : c et d dans {−2, …, 2} (fenêtre commune aux quatre courbes), bases 2, 3, 4, 5 et 1/2,
 *   1/3, 1/4 seulement ; deux bases de même sens de variation sont choisies assez différentes pour
 *   que leurs courbes se distinguent à l'œil (rapport des logarithmes ≥ 1,3 : jamais 3 et 4, 4 et 5,
 *   1/3 et 1/4).
 */

const BASES_SUP_LECTURE: BaseLog[] = [2, 3, 4, 5, 10].map((n) => ({ num: n, den: 1 }));
const BASES_INF: BaseLog[] = [2, 3, 4].map((n) => ({ num: 1, den: n }));
const BASES_SUP_ASSOCIER: BaseLog[] = [2, 3, 4, 5].map((n) => ({ num: n, den: 1 }));

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

function melanger<T>(t: readonly T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Deux bases de même sens de variation se distinguent-elles à l'œil ? (rapport des ln ≥ 1,3) */
function basesDistinctes(b1: BaseLog, b2: BaseLog): boolean {
  const l1 = Math.log(entierBase(b1));
  const l2 = Math.log(entierBase(b2));
  return Math.max(l1, l2) / Math.min(l1, l2) >= 1.3;
}

export function construireLecture(): ExerciceLectureCourbeLog {
  const croissante = Math.random() < 0.5;
  const base = choisir(croissante ? BASES_SUP_LECTURE : BASES_INF);
  const c = entier(-3, 3);
  const d = entier(-3, 3);
  const pUn = Math.random() < 0.5;
  return { variante: "lecture", courbe: { base, c, d }, lettrePointUn: pUn ? "P" : "Q", lettrePointBase: pUn ? "Q" : "P" };
}

export function construireAssocier(): ExerciceAssocierCourbesLog {
  const c0 = entier(-2, 2);
  const d0 = entier(-2, 2);
  const b1 = choisir([...BASES_SUP_ASSOCIER, ...BASES_INF]);
  const memeSens = estCroissante(b1) ? BASES_SUP_ASSOCIER : BASES_INF;
  const sensOppose = estCroissante(b1) ? BASES_INF : BASES_SUP_ASSOCIER;
  const b2 = choisir(sensOppose);
  const b3 = choisir(memeSens.filter((b) => b.num !== b1.num || b.den !== b1.den).filter((b) => basesDistinctes(b, b1)));
  const autres = (v: number) => [-2, -1, 0, 1, 2].filter((x) => x !== v);
  const e4: CourbeLog = Math.random() < 0.5 ? { base: b1, c: choisir(autres(c0)), d: d0 } : { base: b1, c: c0, d: choisir(autres(d0)) };
  const expressions = melanger<CourbeLog>([{ base: b1, c: c0, d: d0 }, { base: b2, c: c0, d: d0 }, { base: b3, c: c0, d: d0 }, e4]);
  const expressionDeCourbe = melanger([0, 1, 2, 3]);
  return { variante: "associer", expressions, expressionDeCourbe };
}

export function construireVariante(variante: VarianteLireCourbeLogarithmique): ExerciceLireCourbeLogarithmique {
  return variante === "lecture" ? construireLecture() : construireAssocier();
}

export function genererExerciceLireCourbeLogarithmique(): ExerciceLireCourbeLogarithmique {
  return construireVariante(Math.random() < 0.5 ? "lecture" : "associer");
}

/** Catalogue dev (`SelecteurVarianteDev`) — libellés neutres, jamais la réponse. */
export const CATALOGUE_VARIANTES: { id: VarianteLireCourbeLogarithmique; label: string }[] = [
  { id: "lecture", label: "Lire asymptote, domaine, base et expression" },
  { id: "associer", label: "Associer 4 courbes et 4 expressions" },
];

export function construireAvecVarianteId(id: VarianteLireCourbeLogarithmique): ExerciceLireCourbeLogarithmique {
  return construireVariante(id);
}
