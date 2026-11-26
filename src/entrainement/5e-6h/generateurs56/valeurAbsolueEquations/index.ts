import { borneQ, borneRacine, MOINS_INF, PLUS_INF, pointX, REELS_X } from "../communReels/ensemblesExacts";
import type { EnsembleX } from "../communReels/ensemblesExacts";
import { ent, parmi, q } from "../communReels/outilsReels";
import type { Q } from "../communReels/outilsReels";
import type { ExerciceAbsolue, SigneC, SorteOption, Symbole, VarianteAbsolue } from "./core/types";

/**
 * Couche A — générateur de `56gen18`. `Math.random()` seul (le `?code=` rejoue le tirage).
 * equation / inequation : signe de c tiré au tiers AVANT a, b, c (verdict) ; symbole d'inéquation
 * tiré au quart ; a ∈ {±1 … ±4}, b ∈ {−9 … 9}∖{0}, |c| ∈ {1 … 9}. deuxAbsolues : a ≠ ±c, deux
 * solutions distinctes. carre : |x² − k| ⋚ c avec 1 ≤ c < k ≤ 12 (quatre bornes ±√(k − c), ±√(k + c)).
 */

export type IdVarianteAbsolue = VarianteAbsolue;

export const CATALOGUE_VARIANTES: { id: IdVarianteAbsolue; label: string }[] = [
  { id: "equation", label: "|ax + b| = c" },
  { id: "inequation", label: "|ax + b| < c, ≤ c, > c ou ≥ c" },
  { id: "deuxAbsolues", label: "|ax + b| = |cx + d|" },
  { id: "carre", label: "|x² − k| comparé à c" },
];

const ORDRE: SorteOption[] = ["deux", "une", "entre", "dehors", "seulDroite", "oubliK", "zero", "nonZero", "aucune", "tous"];
const trier = (l: SorteOption[]) => ORDRE.filter((s) => l.includes(s));

export const racineQ = (a: number, b: number, c: number): Q => q(c - b, a);

const VIDE = { d: 0, x1: null, x2: null };

function tirerSigne(): SigneC {
  return parmi(["negatif", "nul", "positif"] as const);
}

function coefs(): { a: number; b: number } {
  return { a: parmi([-4, -3, -2, -1, 1, 2, 3, 4]), b: parmi([-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]) };
}

function construireEquation(): ExerciceAbsolue {
  const signe = tirerSigne();
  const { a, b } = coefs();
  const c = signe === "nul" ? 0 : signe === "positif" ? ent(1, 9) : -ent(1, 9);
  let solutions: EnsembleX = [];
  let bonne: SorteOption;
  let options: SorteOption[];
  if (signe === "positif") {
    const s1 = racineQ(a, b, -c);
    const s2 = racineQ(a, b, c);
    solutions = [pointX(borneQ(s1)), pointX(borneQ(s2))];
    bonne = "deux";
    options = ["deux", "une", "zero", "aucune"];
  } else if (signe === "nul") {
    solutions = [pointX(borneQ(racineQ(a, b, 0)))];
    bonne = "zero";
    options = ["zero", "nonZero", "aucune", "tous"];
  } else {
    bonne = "aucune";
    options = ["aucune", "deux", "une", "tous"];
  }
  return { ...VIDE, variante: "equation", a, b, c, symbole: "=", signe, options: trier(options), bonne, solutions };
}

/** Intervalle entre deux rationnels (ordonnés). */
function entreQ(x: Q, y: Q, ferme: boolean): EnsembleX {
  const [g, d] = x.n / x.d <= y.n / y.d ? [x, y] : [y, x];
  return [{ g: borneQ(g), gF: ferme, d: borneQ(d), dF: ferme }];
}
function dehorsQ(x: Q, y: Q, ferme: boolean): EnsembleX {
  const [g, d] = x.n / x.d <= y.n / y.d ? [x, y] : [y, x];
  return [
    { g: MOINS_INF, gF: false, d: borneQ(g), dF: ferme },
    { g: borneQ(d), gF: ferme, d: PLUS_INF, dF: false },
  ];
}

function construireInequation(): ExerciceAbsolue {
  const signe = tirerSigne();
  const symbole = parmi(["<", "\\leq", ">", "\\geq"] as const);
  const { a, b } = coefs();
  const c = signe === "nul" ? 0 : signe === "positif" ? ent(1, 9) : -ent(1, 9);
  const petit = symbole === "<" || symbole === "\\leq";
  const ferme = symbole === "\\leq" || symbole === "\\geq";
  let solutions: EnsembleX;
  let bonne: SorteOption;
  let options: SorteOption[];
  if (signe === "positif") {
    const s1 = racineQ(a, b, -c);
    const s2 = racineQ(a, b, c);
    solutions = petit ? entreQ(s1, s2, ferme) : dehorsQ(s1, s2, ferme);
    bonne = petit ? "entre" : "dehors";
    options = ["entre", "dehors", "aucune", "tous"];
  } else if (signe === "nul") {
    const x0 = borneQ(racineQ(a, b, 0));
    const table: Record<string, [SorteOption, EnsembleX]> = {
      "<": ["aucune", []],
      "\\leq": ["zero", [pointX(x0)]],
      ">": ["nonZero", [{ g: MOINS_INF, gF: false, d: x0, dF: false }, { g: x0, gF: false, d: PLUS_INF, dF: false }]],
      "\\geq": ["tous", REELS_X],
    };
    [bonne, solutions] = table[symbole];
    options = ["zero", "nonZero", "aucune", "tous"];
  } else {
    bonne = petit ? "aucune" : "tous";
    solutions = petit ? [] : REELS_X;
    options = ["aucune", "tous", "entre", "dehors"];
  }
  return { ...VIDE, variante: "inequation", a, b, c, symbole, signe, options: trier(options), bonne, solutions };
}

function construireDeuxAbsolues(): ExerciceAbsolue {
  for (;;) {
    const { a, b } = coefs();
    const c = parmi([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const d = ent(-9, 9);
    if (c === a || c === -a || (d === b && Math.random() < 0.7)) continue;
    const x1 = q(d - b, a - c);
    const x2 = q(-(b + d), a + c);
    if (x1.n * x2.d === x2.n * x1.d || x1.d > 8 || x2.d > 8) continue;
    return { variante: "deuxAbsolues", a, b, c, d, symbole: "=", signe: null, options: [], bonne: null, x1, x2, solutions: [pointX(borneQ(x1)), pointX(borneQ(x2))] };
  }
}

function construireCarre(): ExerciceAbsolue {
  const k = ent(2, 12);
  const c = ent(1, k - 1);
  const symbole = parmi(["<", "\\leq", ">", "\\geq"] as const) as Symbole;
  const petit = symbole === "<" || symbole === "\\leq";
  const ferme = symbole === "\\leq" || symbole === "\\geq";
  const r1 = borneRacine(k - c, 1);
  const r1m = borneRacine(k - c, -1);
  const r2 = borneRacine(k + c, 1);
  const r2m = borneRacine(k + c, -1);
  const solutions: EnsembleX = petit
    ? [
        { g: r2m, gF: ferme, d: r1m, dF: ferme },
        { g: r1, gF: ferme, d: r2, dF: ferme },
      ]
    : [
        { g: MOINS_INF, gF: false, d: r2m, dF: ferme },
        { g: r1m, gF: ferme, d: r1, dF: ferme },
        { g: r2, gF: ferme, d: PLUS_INF, dF: false },
      ];
  return { ...VIDE, variante: "carre", a: k, b: 0, c, symbole, signe: null, options: trier(["entre", "dehors", "seulDroite", "oubliK"]), bonne: petit ? "entre" : "dehors", solutions };
}

export function construireAvecVarianteId(id: IdVarianteAbsolue): ExerciceAbsolue {
  if (id === "equation") return construireEquation();
  if (id === "inequation") return construireInequation();
  if (id === "deuxAbsolues") return construireDeuxAbsolues();
  return construireCarre();
}

export function genererExerciceAbsolue(): ExerciceAbsolue {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
