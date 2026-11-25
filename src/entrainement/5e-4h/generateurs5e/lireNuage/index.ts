import type { ExerciceLireNuage, FormeNuage, IntensiteNuage, NuageGenere, SensNuage, VarianteLireNuage } from "../../core5e/lireNuage";
import type { Pt } from "../../core5e/stat2vLotH1";
import { arrondi, correlation, entier, melanger, moindresCarres, normale, ordonneesCorrelees, parmi, somme } from "../../core5e/stat2vLotH1";

/**
 * Couche A — générateur de `5gen76` « Lire un nuage de points ». `Math.random()` seul (le `?code=` rejoue le
 * tirage). Verdict tiré à parts égales AVANT le nuage :
 * - forme : affine (r de 0,90 à 0,97 en valeur absolue, sens au hasard), arc (sommet au milieu, ouvert vers le
 *   bas ou vers le haut, R² du second degré ≥ 0,92 et |r| ≤ 0,45), décolle (exponentielle croissante, pente
 *   de la seconde moitié ≥ 4 × celle de la première), aucune (|r| ≤ 0,15, R² du second degré ≤ 0,12) ;
 * - intensité : forte (|r| de 0,87 à 0,95), moyenne (0,66 à 0,76), faible (0,42 à 0,53), sens au hasard ;
 * - associer : 4 classes distinctes parmi −forte, −moyenne, nulle, +moyenne, +forte.
 * Coordonnées arrondies au dixième puis r RECALCULÉ ; on recommence tant que le nuage s'écarte de sa cible.
 */

/** R² de l'ajustement du second degré par les moindres carrés (équations normales 3 × 3). */
export function ajustementSecondDegre(p: readonly Pt[]): { c: [number, number, number]; r2: number } {
  const S = (k: number) => somme(p.map((q) => q.x ** k));
  const T = (k: number) => somme(p.map((q) => q.y * q.x ** k));
  const M = [
    [S(4), S(3), S(2), T(2)],
    [S(3), S(2), S(1), T(1)],
    [S(2), S(1), p.length, T(0)],
  ];
  for (let i = 0; i < 3; i++) {
    let piv = i;
    for (let j = i + 1; j < 3; j++) if (Math.abs(M[j]![i]!) > Math.abs(M[piv]![i]!)) piv = j;
    [M[i], M[piv]] = [M[piv]!, M[i]!];
    for (let j = 0; j < 3; j++) {
      if (j === i) continue;
      const f = M[j]![i]! / M[i]![i]!;
      for (let k = i; k < 4; k++) M[j]![k]! -= f * M[i]![k]!;
    }
  }
  const c: [number, number, number] = [M[0]![3]! / M[0]![0]!, M[1]![3]! / M[1]![1]!, M[2]![3]! / M[2]![2]!];
  const my = somme(p.map((q) => q.y)) / p.length;
  const sst = somme(p.map((q) => (q.y - my) ** 2));
  const sse = somme(p.map((q) => (q.y - (c[0] * q.x ** 2 + c[1] * q.x + c[2])) ** 2));
  return { c, r2: 1 - sse / sst };
}

/** Abscisses étalées sur [0 ; 10] (une par tranche, au hasard dans la tranche). */
function abscisses(n: number): number[] {
  return Array.from({ length: n }, (_, i) => arrondi(((i + 0.15 + 0.7 * Math.random()) * 10) / n, 1));
}

const arrondir = (p: Pt[]): Pt[] => p.map((q) => ({ x: arrondi(q.x, 1), y: arrondi(q.y, 1) }));

/** Nuage d'allure affine de coefficient r ∈ [rMin ; rMax] (signe compris), contrôlé après arrondi. */
export function nuageAffine(rMin: number, rMax: number, n = entier(14, 18)): NuageGenere {
  for (;;) {
    const cible = rMin + Math.random() * (rMax - rMin);
    const x = abscisses(n);
    const z = ordonneesCorrelees(x, cible);
    const pts = arrondir(x.map((v, i) => ({ x: v, y: 5 + 1.5 * z[i]! })));
    const r = correlation(pts);
    if (r < rMin || r > rMax) continue;
    const { a, b } = moindresCarres(pts);
    return { points: pts, r, modele: { genre: "droite", a, b } };
  }
}

function nuageArc(ouvertVersLeBas: boolean): NuageGenere {
  for (;;) {
    const n = entier(13, 16);
    const x = abscisses(n);
    const h = 4 + 2 * Math.random();
    const A = 2.2 + Math.random();
    const s = ouvertVersLeBas ? 1 : -1;
    const pts = arrondir(x.map((v) => ({ x: v, y: 5 + s * (A - 0.064 * A * (v - h) ** 2) + 0.25 * normale() })));
    const ajust = ajustementSecondDegre(pts);
    const r = correlation(pts);
    if (ajust.r2 < 0.92 || Math.abs(r) > 0.45) continue;
    if ((ajust.c[0] < 0) !== ouvertVersLeBas) continue;
    return { points: pts, r, modele: { genre: "parabole", c: ajust.c } };
  }
}

function nuageDecolle(): NuageGenere {
  for (;;) {
    const n = entier(13, 16);
    const x = abscisses(n);
    const q = 1.3 + 0.12 * Math.random();
    const c = 0.25 + 0.1 * Math.random();
    const pts = arrondir(x.map((v) => ({ x: v, y: 1 + c * q ** v + 0.12 * normale() })));
    const moitie = Math.floor(n / 2);
    const pente = (u: Pt[]) => (u[u.length - 1]!.y - u[0]!.y) / (u[u.length - 1]!.x - u[0]!.x);
    const p1 = pente(pts.slice(0, moitie));
    const p2 = pente(pts.slice(moitie));
    if (!(p2 > 0 && p2 >= 4 * Math.max(p1, 0.05))) continue;
    if (pts.some((u, i) => i > 0 && u.y < pts[i - 1]!.y - 0.35)) continue;
    return { points: pts, r: correlation(pts), modele: { genre: "exponentielle", k: 1, c, q } };
  }
}

function nuageAucune(): NuageGenere {
  for (;;) {
    const n = entier(14, 18);
    const x = abscisses(n);
    const pts = arrondir(x.map((v) => ({ x: v, y: 2 + 6 * Math.random() })));
    const r = correlation(pts);
    if (Math.abs(r) > 0.15) continue;
    if (ajustementSecondDegre(pts).r2 > 0.12) continue;
    return { points: pts, r };
  }
}

const FORMES: FormeNuage[] = ["affine", "arc", "decolle", "aucune"];
const INTENSITES: Record<IntensiteNuage, [number, number]> = { forte: [0.87, 0.95], moyenne: [0.66, 0.76], faible: [0.42, 0.53] };
/** Classes de r du mode « associer » (bornes, signe compris). */
export const CLASSES_ASSOCIER: [number, number][] = [
  [-0.97, -0.88],
  [-0.75, -0.5],
  [-0.15, 0.15],
  [0.5, 0.75],
  [0.88, 0.97],
];

export function construire(variante: VarianteLireNuage): ExerciceLireNuage {
  if (variante === "forme") {
    const forme = parmi(FORMES);
    if (forme === "affine") {
      const positif = Math.random() < 0.5;
      const nuage = positif ? nuageAffine(0.9, 0.97) : nuageAffine(-0.97, -0.9);
      return { variante, forme, sens: positif ? "croissant" : "decroissant", nuages: [nuage] };
    }
    if (forme === "arc") return { variante, forme, sens: "montePuisDescend", nuages: [nuageArc(Math.random() < 0.5)] };
    if (forme === "decolle") return { variante, forme, sens: "croissant", nuages: [nuageDecolle()] };
    return { variante, forme, sens: "aucun" as SensNuage, nuages: [nuageAucune()] };
  }
  if (variante === "intensite") {
    const intensite = parmi(["forte", "moyenne", "faible"] as const);
    const positif = Math.random() < 0.5;
    const [lo, hi] = INTENSITES[intensite];
    const nuage = positif ? nuageAffine(lo, hi) : nuageAffine(-hi, -lo);
    return { variante, intensite, positif, nuages: [nuage] };
  }
  for (;;) {
    const classes = melanger([0, 1, 2, 3, 4]).slice(0, 4);
    const nuages = classes.map((c) => nuageAffine(CLASSES_ASSOCIER[c]![0], CLASSES_ASSOCIER[c]![1], entier(12, 16)));
    const valeurs = nuages.map((u) => arrondi(u.r, 2));
    if (new Set(valeurs).size < 4) continue;
    const valeursR = [...valeurs].sort((a, b) => a - b);
    return { variante, nuages, valeursR, bonnes: valeurs.map((v) => valeursR.indexOf(v)) };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteLireNuage; label: string }[] = [
  { id: "forme", label: "Forme et sens d'un nuage" },
  { id: "intensite", label: "Sens et intensité d'une corrélation" },
  { id: "associer", label: "Associer quatre nuages à leur r" },
];

export function construireAvecVarianteId(id: string): ExerciceLireNuage {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceLireNuage(): ExerciceLireNuage {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
