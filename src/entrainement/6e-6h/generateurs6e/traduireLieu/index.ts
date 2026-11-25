import type { ExerciceTL, SituationTL, VarianteTL } from "../../core6e/traduireLieu";
import type { D, Pt } from "../../ui6e/outilsLieuxLotH2";
import { dist2, entier, parmi } from "../../ui6e/outilsLieuxLotH2";

/**
 * Couche A — générateur de `6gen128` « Traduire un lieu : réciproque et points exclus ». `Math.random()`
 * seul (le `?code=` rejoue le tirage). Le VERDICT (nombre de points exclus, 0 / 1 / 2) est tiré EN
 * PREMIER, à parts égales, puis la situation qui le réalise dans la variante, puis les nombres (entiers
 * petits : figure lisible à 390 px, coefficients entiers dans l'équation attendue).
 */

export const CATALOGUE_VARIANTES: { id: VarianteTL; label: string }[] = [
  { id: "cercle", label: "Le lieu complet est un cercle" },
  { id: "droites", label: "Le lieu complet est une droite ou deux droites" },
];

const ZERO: Pt = { x: 0, y: 0 };
const D0: D = { a: 0, b: 1, c: 0 };

function deuxPoints(): { A: Pt; B: Pt } {
  for (;;) {
    const A = { x: entier(-4, 2), y: entier(-4, 2) };
    const B = { x: A.x + parmi([-1, 1]) * entier(2, 6), y: A.y + entier(-5, 5) };
    if (B.x < -5 || B.x > 6 || B.y < -5 || B.y > 6) continue;
    if (dist2(A, B) < 8 || dist2(A, B) > 52) continue;
    return { A, B };
  }
}

const VECTEURS_5: Pt[] = [
  { x: 3, y: 4 },
  { x: 4, y: 3 },
  { x: -3, y: 4 },
  { x: -4, y: 3 },
  { x: 3, y: -4 },
  { x: 4, y: -3 },
  { x: -3, y: -4 },
  { x: -4, y: -3 },
  { x: 5, y: 0 },
  { x: 0, y: 5 },
  { x: -5, y: 0 },
  { x: 0, y: -5 },
];

function base(variante: VarianteTL, nbExclus: 0 | 1 | 2, situation: SituationTL): ExerciceTL {
  return { variante, nbExclus, situation, A: ZERO, B: ZERO, O: ZERO, r: 0, M: ZERO, d: D0, h: 0, d1: D0, d2: D0 };
}

function situationDe(variante: VarianteTL, n: 0 | 1 | 2): SituationTL {
  if (variante === "cercle") return n === 0 ? parmi(["pythagore", "milieuExt"] as const) : n === 1 ? "corde" : "thales";
  return n === 0 ? parmi(["mediatrice", "distance"] as const) : n === 1 ? parmi(["isocele", "bissectrices"] as const) : "rectangleAB";
}

export function construire(variante: VarianteTL): ExerciceTL {
  const nbExclus = parmi([0, 1, 2] as const);
  const situation = situationDe(variante, nbExclus);
  const e = base(variante, nbExclus, situation);
  switch (situation) {
    case "pythagore":
    case "thales":
    case "mediatrice":
    case "isocele":
    case "rectangleAB":
      return { ...e, ...deuxPoints() };
    case "corde": {
      const O = { x: entier(-3, 3), y: entier(-2, 2) };
      const r = parmi([2, 4, 5]);
      const v = r === 5 ? parmi(VECTEURS_5) : parmi([{ x: r, y: 0 }, { x: -r, y: 0 }, { x: 0, y: r }, { x: 0, y: -r }]);
      return { ...e, O, r, M: { x: O.x + v.x, y: O.y + v.y } };
    }
    case "milieuExt": {
      for (;;) {
        const O = { x: entier(-3, 2), y: entier(-2, 2) };
        const r = parmi([2, 4]);
        const i = entier(-3, 3);
        const j = entier(-3, 3);
        const d2 = 4 * (i * i + j * j);
        if (d2 <= (r + 1) * (r + 1) || d2 > 64) continue;
        return { ...e, O, r, M: { x: O.x + 2 * i, y: O.y + 2 * j } };
      }
    }
    case "distance": {
      const [a, b] = parmi([
        [3, 4],
        [4, 3],
        [3, -4],
        [4, -3],
        [0, 1],
        [1, 0],
      ] as const);
      const Q = { x: entier(-2, 2), y: entier(-2, 2) };
      return { ...e, d: { a, b, c: -(a * Q.x + b * Q.y) }, h: parmi([1, 2]) };
    }
    case "bissectrices": {
      const K = { x: entier(-2, 2), y: entier(-2, 2) };
      const echange = Math.random() < 0.5;
      let a: number, b: number;
      do {
        a = entier(1, 3);
        b = entier(1, 3);
      } while (a === b);
      const n1 = { a, b };
      const n2 = echange ? { a: b, b: a } : { a, b: -b };
      const droite = (n: { a: number; b: number }): D => ({ a: n.a, b: n.b, c: -(n.a * K.x + n.b * K.y) });
      return { ...e, d1: droite(n1), d2: droite(n2) };
    }
  }
}

export function construireAvecVariante(id: string): ExerciceTL {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceTL(): ExerciceTL {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
