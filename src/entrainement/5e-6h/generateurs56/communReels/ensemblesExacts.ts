import { normaliser as normaliserNum, egaux } from "../../../5e-4h/moteur5e/ensemblesReels";
import type { Ensemble as EnsembleNum } from "../../../5e-4h/moteur5e/ensemblesReels";
import { pgcd, racineSimplifiee } from "./outilsReels";
import type { Q } from "./outilsReels";

/**
 * Ensembles de réels à bornes EXACTES (rationnels, ±c√r/d) pour 56gen18 : écriture KaTeX des réponses
 * (∅, ℝ, ℝ∖{a}, {a ; b}, réunions d'intervalles) et conversion en ensemble numérique de
 * `5e-4h/moteur5e/ensemblesReels.ts`, qui LIT la saisie de l'élève (« {−3 ; 7} », « ]1 ; 4[ ∪ … »,
 * « ℝ \ {2} », « ∅ », bornes √) et compare. Une seule source pour l'écran, le corrigé et le papier.
 */

export interface BorneX {
  v: number;
  L: string;
}

export interface IntervalleX {
  g: BorneX;
  gF: boolean;
  d: BorneX;
  dF: boolean;
}

export type EnsembleX = IntervalleX[];

export const MOINS_INF: BorneX = { v: -Infinity, L: "-\\infty" };
export const PLUS_INF: BorneX = { v: Infinity, L: "+\\infty" };
export const REELS_X: EnsembleX = [{ g: MOINS_INF, gF: false, d: PLUS_INF, dF: false }];

export function borneQ(a: Q): BorneX {
  const L = a.d === 1 ? `${a.n}` : `${a.n < 0 ? "-" : ""}\\dfrac{${Math.abs(a.n)}}{${a.d}}`;
  return { v: a.n / a.d, L };
}

/** ±√m simplifié (m > 0) : « 2\sqrt{2} », « 3 », « -\sqrt{6} ». */
export function borneRacine(m: number, signe: 1 | -1): BorneX {
  const { c, r } = racineSimplifiee(m);
  const corps = r === 1 ? `${c}` : `${c === 1 ? "" : c}\\sqrt{${r}}`;
  return { v: signe * Math.sqrt(m), L: `${signe < 0 ? "-" : ""}${corps}` };
}

export const pointX = (b: BorneX): IntervalleX => ({ g: b, gF: true, d: b, dF: true });

export function versNumerique(e: EnsembleX): EnsembleNum {
  return normaliserNum(e.map((i) => ({ g: i.g.v, gF: i.gF, d: i.d.v, dF: i.dF })));
}

export const egauxX = (a: EnsembleX, n: EnsembleNum): boolean => egaux(versNumerique(a), normaliserNum(n));

function intervalleL(i: IntervalleX): string {
  if (i.g.v === i.d.v) return `\\{${i.g.L}\\}`;
  return `${i.gF ? "[" : "\\mathopen{]}"}${i.g.L}\\,;\\,${i.d.L}${i.dF ? "]" : "\\mathclose{[}"}`;
}

/** ∅, ℝ, ℝ∖{a}, {a ; b} (points seuls), sinon réunion d'intervalles (ordre croissant). */
export function ensembleXL(e: EnsembleX): string {
  const l = [...e].sort((a, b) => a.g.v - b.g.v);
  if (l.length === 0) return "\\varnothing";
  if (l.length === 1 && l[0].g.v === -Infinity && l[0].d.v === Infinity) return "\\mathbb{R}";
  if (l.length === 2 && l[0].g.v === -Infinity && l[1].d.v === Infinity && !l[0].dF && !l[1].gF && l[0].d.v === l[1].g.v) return `\\mathbb{R}\\setminus\\{${l[0].d.L}\\}`;
  if (l.every((i) => i.g.v === i.d.v)) return `\\{${l.map((i) => i.g.L).join("\\,;\\,")}\\}`;
  return l.map(intervalleL).join("\\cup ");
}

/** Écriture exacte probable d'un nombre lu (aperçu de la saisie) : entier, fraction (dénominateur ≤
 * 60), ±c√r/d (r ≤ 60 sans facteur carré, c ≤ 12, d ≤ 6), sinon décimal. */
export function nombreExactL(v: number): string {
  if (!Number.isFinite(v)) return v > 0 ? "+\\infty" : "-\\infty";
  const s = v < 0 ? "-" : "";
  const a = Math.abs(v);
  for (let d = 1; d <= 60; d++) {
    const n = Math.round(a * d);
    if (Math.abs(a * d - n) < 1e-9) return d === 1 ? `${s}${n}` : `${s}\\dfrac{${n}}{${d}}`;
  }
  for (let r = 2; r <= 60; r++) {
    if (racineSimplifiee(r).c !== 1) continue;
    for (let d = 1; d <= 6; d++)
      for (let c = 1; c <= 12; c++)
        if (Math.abs((c * Math.sqrt(r)) / d - a) < 1e-9) {
          if (pgcd(c, d) !== 1) continue;
          const num = `${c === 1 ? "" : c}\\sqrt{${r}}`;
          return d === 1 ? `${s}${num}` : `${s}\\dfrac{${num}}{${d}}`;
        }
  }
  return `${Math.round(v * 1000) / 1000}`.replace(".", "{,}").replace("-", "-");
}
