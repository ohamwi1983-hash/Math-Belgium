import type { ContexteModeliser, ExerciceModeliserPrevoir } from "../../core5e/modeliserPrevoir";
import type { Point2 } from "../../core5e/statistiqueLotH2";
import { arrondi, entier, gauss, melanger, parmi, resume } from "../../core5e/statistiqueLotH2";

/**
 * Couche A — générateur de `5gen78` « Modéliser et prévoir en contexte ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). Ordre du tirage : verdicts (fiable, interpolation) à parts égales, PUIS
 * la série : une loi affine plausible (ordres de grandeur réels, nombres nouveaux), un bruit gaussien
 * dont l'écart-type est une fraction de l'étendue des y (faible si fiable, fort sinon), valeurs
 * arrondies à la précision du tableau, puis r recalculé sur la série ARRONDIE et accepté seulement
 * dans la bande du verdict (|r| ∈ [0,86 ; 0,995] ou [0,45 ; 0,74]). Contextes (document du
 * professeur, nombres recalculés) : dilatation d'une barre de 10 m (≈ 0,12 mm par °C pour l'acier),
 * charge maximale d'une grue selon la flèche, pourcentage de pièces défectueuses (seuil 5 %),
 * entreprises prêtes à acheter selon le prix, population d'une commune, consommation selon la
 * puissance.
 */

interface Tirage {
  xs: number[];
  alpha: number;
  beta: number;
  decY: number;
  da: number;
  db: number;
  dp: number;
  ds: number;
  /** Abscisses candidates pour la prévision (interpolation : dans ]min ; max[ hors tableau). */
  interp: number[];
  extrap: number[];
  /** Seuil tiré une fois la série connue. */
  seuil: (alpha: number, beta: number, xs: number[]) => { seuil: number; longueur?: number };
  annee0?: number;
}

const pas = (debut: number, n: number, p: number) => Array.from({ length: n }, (_, i) => debut + i * p);
const entre = (a: number, b: number, p: number) => {
  const t: number[] = [];
  for (let v = a; v <= b + 1e-9; v += p) t.push(arrondi(v, 2));
  return t;
};
const hors = (cands: number[], xs: number[]) => cands.filter((c) => !xs.some((x) => Math.abs(x - c) < 1e-9));
const uniforme = (a: number, b: number) => a + Math.random() * (b - a);

function tirage(v: ContexteModeliser): Tirage {
  switch (v) {
    case "dilatation": {
      const xs = pas(parmi([20, 40]), 7, 20);
      const alpha = arrondi(uniforme(0.115, 0.15), 3);
      const beta = arrondi(-20 * alpha + uniforme(-0.6, 0.6), 1);
      const min = xs[0]!;
      const max = xs[xs.length - 1]!;
      return {
        xs, alpha, beta, decY: 1, da: 3, db: 2, dp: 1, ds: 0,
        interp: hors(entre(min + 10, max - 10, 10), xs),
        extrap: [...entre(max + 20, max + 80, 10), ...(min >= 40 ? [0, 10] : [])],
        seuil: (a, b) => {
          const mm = Math.round(a * (max + entier(2, 8) * 10) + b);
          return { seuil: mm, longueur: 10 + mm / 1000 };
        },
      };
    }
    case "grue": {
      const debut = parmi([20, 25]);
      const n = entier(6, 8);
      const xs = pas(debut, n, 5);
      const alpha = -arrondi(uniforme(0.13, 0.2), 3);
      const y25 = uniforme(5.6, 7);
      const beta = arrondi(y25 - 25 * alpha, 2);
      const min = xs[0]!;
      const max = xs[xs.length - 1]!;
      return {
        xs, alpha, beta, decY: 2, da: 3, db: 2, dp: 2, ds: 1,
        interp: hors(entre(min + 1, max - 1, 1), xs).filter((x) => x % 5 !== 0),
        extrap: [...entre(max + 3, max + 15, 1), min - 5, min - 3],
        seuil: (a, b) => ({ seuil: arrondi(a * uniforme(min + 2, max + 8) + b, 1) }),
      };
    }
    case "defectueuses": {
      const debut = parmi([1, 2]);
      const xs = pas(debut, 8, 2);
      const max = xs[xs.length - 1]!;
      const beta = arrondi(uniforme(0.3, 0.8), 2);
      const alpha = arrondi((5 - beta) / uniforme(max + 2, max + 10), 3);
      return {
        xs, alpha, beta, decY: 2, da: 3, db: 2, dp: 2, ds: 1,
        interp: hors(entre(xs[0]! + 1, max - 1, 1), xs),
        extrap: entre(max + 2, max + 6, 1),
        seuil: () => ({ seuil: 5 }),
      };
    }
    case "ventes": {
      const grille = entre(8, 32, 0.5);
      const xs = melanger(grille).slice(0, 8).sort((p, q) => p - q);
      if (xs[xs.length - 1]! - xs[0]! < 14) return tirage(v);
      const alpha = -arrondi(uniforme(7.5, 10.5), 2);
      const beta = arrondi(uniforme(275, 295) - 9 * alpha, 1);
      const min = xs[0]!;
      const max = xs[xs.length - 1]!;
      return {
        xs, alpha, beta, decY: 0, da: 2, db: 1, dp: 0, ds: 1,
        interp: hors(entre(Math.ceil(min) + 1, Math.floor(max) - 1, 1), xs),
        extrap: [...entre(Math.ceil(max) + 3, Math.ceil(max) + 8, 1), ...(min >= 9 ? [Math.floor(min) - 3, Math.floor(min) - 2] : [])],
        seuil: (a, b) => ({ seuil: parmi([300, 100, 150, 50].filter((s) => (s - b) / a > 1)) }),
      };
    }
    case "population": {
      const xs = pas(0, 8, 2);
      const alpha = entier(120, 450);
      const beta = entier(80, 280) * 100;
      return {
        xs, alpha, beta, decY: 0, da: 1, db: 0, dp: 0, ds: 1, annee0: 2010,
        interp: [1, 3, 5, 7, 9, 11, 13],
        extrap: entre(18, 30, 1),
        seuil: (a, b) => ({ seuil: Math.round((a * uniforme(17, 30) + b) / 500) * 500 }),
      };
    }
    case "consommation": {
      const xs = melanger([60, 70, 75, 85, 90, 100, 110, 120, 130, 140, 150, 160, 175, 190, 200]).slice(0, 8).sort((p, q) => p - q);
      if (xs[xs.length - 1]! - xs[0]! < 90) return tirage(v);
      const alpha = arrondi(uniforme(0.022, 0.032), 4);
      const beta = arrondi(uniforme(2.3, 3.3), 2);
      const min = xs[0]!;
      const max = xs[xs.length - 1]!;
      return {
        xs, alpha, beta, decY: 1, da: 4, db: 2, dp: 1, ds: 0,
        interp: hors(entre(min + 5, max - 5, 5), xs),
        extrap: [...entre(max + 40, max + 120, 10), ...(min >= 70 ? [40, 50] : [])],
        seuil: (a, b) => ({ seuil: arrondi(a * uniforme(max + 20, max + 120) + b, 1) }),
      };
    }
  }
}

const BANDES = { fiable: [0.86, 0.995], pasFiable: [0.45, 0.74] } as const;

function construire(variante: ContexteModeliser, fiable: boolean, interpolation: boolean): ExerciceModeliserPrevoir {
  for (let essai = 0; essai < 4000; essai++) {
    const t = tirage(variante);
    const etendue = Math.abs(t.alpha) * (t.xs[t.xs.length - 1]! - t.xs[0]!);
    const k = fiable ? uniforme(0.03, 0.16) : uniforme(0.3, 0.55);
    const points: Point2[] = t.xs.map((x) => ({ x, y: arrondi(t.alpha * x + t.beta + k * etendue * gauss(), t.decY) }));
    if (points.some((p) => p.y <= 0)) continue;
    const s = resume(points);
    const [lo, hi] = fiable ? BANDES.fiable : BANDES.pasFiable;
    if (Math.abs(s.r) < lo || Math.abs(s.r) > hi || Math.sign(s.r) !== Math.sign(t.alpha)) continue;
    const cands = interpolation ? t.interp : t.extrap;
    if (cands.length === 0) continue;
    const x0 = parmi(cands);
    if (s.a * x0 + s.b <= 0) continue;
    const { seuil, longueur } = t.seuil(s.a, s.b, t.xs);
    const xs = (seuil - s.b) / s.a;
    if (!(xs > 0) || variante === "defectueuses" && xs <= t.xs[t.xs.length - 1]!) continue;
    // Seuil à l'intérieur de la plage des y du tableau évité pour la dilatation (on prolonge).
    return { variante, fiable, interpolation, points, decY: t.decY, da: t.da, db: t.db, dp: t.dp, ds: t.ds, x0, seuil, longueurSeuil: longueur, annee0: t.annee0, stats: s };
  }
  throw new Error("5gen78 : tirage impossible");
}

export const CATALOGUE_VARIANTES: { id: ContexteModeliser; label: string }[] = [
  { id: "dilatation", label: "Dilatation d'une barre métallique" },
  { id: "grue", label: "Charge maximale d'une grue" },
  { id: "defectueuses", label: "Pièces défectueuses (seuil de 5 %)" },
  { id: "ventes", label: "Prix et nombre d'acheteurs" },
  { id: "population", label: "Population d'une commune" },
  { id: "consommation", label: "Consommation selon la puissance" },
];

export function construireAvecVarianteId(id: string): ExerciceModeliserPrevoir {
  const fiable = Math.random() < 0.5;
  const interpolation = Math.random() < 0.5;
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id)?.id ?? parmi(CATALOGUE_VARIANTES).id;
  return construire(v, fiable, interpolation);
}

export function genererExerciceModeliserPrevoir(): ExerciceModeliserPrevoir {
  const fiable = Math.random() < 0.5;
  const interpolation = Math.random() < 0.5;
  return construire(parmi(CATALOGUE_VARIANTES).id, fiable, interpolation);
}
