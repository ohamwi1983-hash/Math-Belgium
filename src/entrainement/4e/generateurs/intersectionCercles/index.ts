import type { Cercle, ExerciceIntersectionCercles, VarianteIntersectionCercles } from "../../core/intersectionCercles.types";
import { difference, pointsCercles, pointsParabole, substitutionCercles, substitutionParabole } from "../../moteur/modeleIntersectionCercles";
import { choisir, entier, melanger, nonNul, type P } from "../../ui/outilsAnalytiqueLotG";

/**
 * Générateur de gen98 « Intersection de deux cercles ». Tout le hasard passe par `Math.random`
 * (`genererAvecCode` : le QR code rouvre le MÊME exercice).
 *
 * Le NOMBRE de points communs (0, 1 ou 2) est tiré en premier, à parts égales, avant toute boucle de
 * rejet. Construction à rebours :
 * - cercle-cercle, 2 points : deux points entiers P, Q symétriques autour d'un milieu M, centres
 *   entiers sur la médiatrice de [PQ] ; 1 point : point de contact T entier, centres alignés avec T
 *   (tangence intérieure ou extérieure) ; 0 point : centres sur une droite de direction w, rayons
 *   tels que les cercles soient disjoints (l'un dans l'autre ou séparés). La droite obtenue par
 *   soustraction a toujours un coefficient ±1 (on isole une coordonnée sans fraction) et un terme
 *   constant entier.
 * - cercle-parabole : sommet et paramètre entiers, cercle centré sur l'axe ; l'équation en y (ou x)
 *   a des racines entières ; 2 points : une racine donne un carré positif (parfait), l'AUTRE un carré
 *   négatif (à rejeter) ; 1 point : le sommet et une racine rejetée ; 0 point : Δ < 0 ou deux
 *   racines rejetées.
 */

const DIRECTIONS: P[] = [
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 2 },
  { x: 1, y: -2 },
  { x: 2, y: 1 },
  { x: 2, y: -1 },
];

const r2 = (A: P, B: P) => (A.x - B.x) ** 2 + (A.y - B.y) ** 2;
const borne = (pts: P[], M: number) => pts.every((p) => Math.abs(p.x) <= M && Math.abs(p.y) <= M);

function construireCercles(nb: 0 | 1 | 2): ExerciceIntersectionCercles {
  for (;;) {
    const w = choisir(DIRECTIONS);
    let c1: Cercle, c2: Cercle;
    if (nb === 2) {
      // P, Q de direction d = w ; centres sur la médiatrice (direction perpendiculaire à w).
      const M = { x: entier(-3, 3), y: entier(-3, 3) };
      const kk = choisir([1, 2]);
      const P = { x: M.x - kk * w.x, y: M.y - kk * w.y };
      const perp = { x: -w.y, y: w.x };
      const s1 = entier(-2, 2);
      const s2 = entier(-2, 2);
      if (s1 === s2) continue;
      const C1 = { x: M.x + s1 * perp.x, y: M.y + s1 * perp.y };
      const C2 = { x: M.x + s2 * perp.x, y: M.y + s2 * perp.y };
      c1 = { centre: C1, R: r2(C1, P) };
      c2 = { centre: C2, R: r2(C2, P) };
    } else if (nb === 1) {
      const T = { x: entier(-3, 3), y: entier(-3, 3) };
      const s1 = nonNul(-2, 2);
      const s2 = nonNul(-3, 3);
      if (s1 === s2) continue;
      const C1 = { x: T.x + s1 * w.x, y: T.y + s1 * w.y };
      const C2 = { x: T.x + s2 * w.x, y: T.y + s2 * w.y };
      c1 = { centre: C1, R: r2(C1, T) };
      c2 = { centre: C2, R: r2(C2, T) };
    } else {
      const C1 = { x: entier(-4, 4), y: entier(-4, 4) };
      const s = nonNul(-3, 3);
      const C2 = { x: C1.x + s * w.x, y: C1.y + s * w.y };
      const d = Math.sqrt(r2(C1, C2));
      const R1 = entier(1, 25);
      const R2 = entier(1, 30);
      const ra = Math.sqrt(R1);
      const rb = Math.sqrt(R2);
      if (!(d > ra + rb + 0.3 || d < Math.abs(ra - rb) - 0.3)) continue;
      c1 = { centre: C1, R: R1 };
      c2 = { centre: C2, R: R2 };
    }
    if (c1.R > 45 || c2.R > 45 || c1.R < 1 || c2.R < 1) continue;
    if (!borne([c1.centre, c2.centre], 6)) continue;
    const { normale } = difference(c1, c2);
    const s = substitutionCercles(c1, normale);
    if (!s || s.racines.length !== nb) continue;
    if (Math.abs(normale.c) > 20 || !Number.isInteger(normale.c)) continue;
    const pts = pointsCercles(s);
    if (!pts.every((p) => Number.isInteger(p.x) && Number.isInteger(p.y))) continue;
    if (Math.max(...s.brut.map(Math.abs)) > 60) continue;
    return { variante: "cercle-cercle", nbPoints: nb, c1, c2, axe: null, S: null, k: null, ordreOptions: [0, 1, 2], points: pts, radicale: normale };
  }
}

function construireParabole(nb: 0 | 1 | 2): ExerciceIntersectionCercles {
  const axe = choisir(["vertical", "horizontal"] as const);
  const ordreOptions = melanger([0, 1, 2]);
  for (;;) {
    const S = { x: entier(-3, 3), y: entier(-3, 3) };
    const k = choisir([-4, -2, -1, 1, 2, 4]);
    const uS = axe === "vertical" ? S.y : S.x;
    const b = uS + nonNul(-5, 5);
    const R = entier(1, 40);
    const centre = axe === "vertical" ? { x: S.x, y: b } : { x: b, y: S.y };
    const e: ExerciceIntersectionCercles = { variante: "cercle-parabole", nbPoints: nb, c1: { centre, R }, c2: null, axe, S, k, ordreOptions, points: [], radicale: null };
    const s = substitutionParabole(e);
    if (s.delta >= 0 && !s.racines.every((r) => Number.isInteger(r))) continue;
    const pos = s.carres.filter((c) => c > 0);
    const nul = s.carres.filter((c) => c === 0);
    const neg = s.carres.filter((c) => c < 0);
    if (pos.some((c) => !Number.isInteger(Math.sqrt(c)))) continue;
    if (s.racines.length === 1) continue; // racine double : jamais (un seul cas de figure, trop particulier)
    let ok = false;
    if (nb === 2) ok = pos.length === 1 && neg.length === 1;
    else if (nb === 1) ok = nul.length === 1 && neg.length === 1;
    else ok = s.racines.length === 0 || neg.length === 2;
    if (!ok) continue;
    const pts = pointsParabole(s);
    if (!borne([...pts, centre], 9)) continue;
    return { ...e, points: pts };
  }
}

export function genererIntersectionCercles(variante: VarianteIntersectionCercles, nb?: 0 | 1 | 2): ExerciceIntersectionCercles {
  const n = nb ?? choisir([0, 1, 2] as const);
  return variante === "cercle-cercle" ? construireCercles(n) : construireParabole(n);
}

export const CATALOGUE_VARIANTES: { id: VarianteIntersectionCercles; label: string }[] = [
  { id: "cercle-cercle", label: "Deux cercles (soustraction, puis substitution)" },
  { id: "cercle-parabole", label: "Un cercle et une parabole (substitution du carré)" },
];

export function construireAvecVariante(id: string): ExerciceIntersectionCercles {
  if (id === "cercle-cercle" || id === "cercle-parabole") return genererIntersectionCercles(id);
  return genererExerciceIntersectionCercles();
}

export function genererExerciceIntersectionCercles(): ExerciceIntersectionCercles {
  return genererIntersectionCercles(Math.random() < 0.5 ? "cercle-cercle" : "cercle-parabole");
}
