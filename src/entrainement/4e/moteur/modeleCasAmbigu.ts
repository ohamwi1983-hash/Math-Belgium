/**
 * Cœur PUR du cas ambigu de la loi des sinus (SSA) — gen74, et réutilisable tel quel par tout
 * générateur qui place un point à distance donnée d'un autre sur une demi-droite (« deux positions
 * possibles »). Aucune dépendance (ni React, ni texte, ni hasard) : seulement des nombres.
 *
 * Données : Â (degrés, dans ]0° ; 180°[), b = AC (côté adjacent à Â) et a = BC (côté opposé à Â).
 * Méthode du cours (section « triangle », bloc « Résoudre le cas ambigu ») :
 * 1. sin B̂ = b · sin Â / a ;
 * 2. sin B̂ > 1 → aucun triangle ; sin B̂ = 1 → un seul candidat, B̂ = 90° ; sinon deux candidats
 *    B̂₁ = sin⁻¹(sin B̂) (aigu) et B̂₂ = 180° − B̂₁ (obtus) ;
 * 3. un candidat donne un triangle si Â + B̂ < 180° ;
 * 4. pour chaque triangle : Ĉ = 180° − Â − B̂, puis c = a · sin Ĉ / sin Â.
 * Toutes les valeurs sont exactes (jamais arrondies ici : l'arrondi est un choix d'affichage).
 *
 * Géométrie (même repère que l'atelier `triangle-cas-ambigu-widget` du cours) : A à l'origine, la
 * demi-droite [Ax) sur l'axe des abscisses positives, C = b · (cos Â ; sin Â). Le cercle de centre C
 * et de rayon a coupe la DROITE (Ax) en 0, 1 ou 2 points ; seuls ceux d'abscisse > 0 sont sur la
 * demi-droite — l'abscisse d'un point B retenu est exactement le côté c du triangle correspondant.
 */

const D2R = Math.PI / 180;
/** Tolérance d'égalité (sin B̂ = 1, somme = 180°) : les données sont des décimaux courts. */
const EPS = 1e-9;

export interface DonneesSSA {
  /** Â en degrés. */
  angleA: number;
  /** b = AC. */
  b: number;
  /** a = BC, opposé à Â. */
  a: number;
}

/** Position de sin B̂ par rapport à 1 — décide du nombre de candidats. */
export type ComparaisonSinusSSA = "superieur" | "egal" | "inferieur";

export interface CandidatSSA {
  /** Rang du candidat : 1 (B̂₁, aigu ou droit) ou 2 (B̂₂ = 180° − B̂₁, obtus). */
  rang: 1 | 2;
  /** B̂ en degrés. */
  angleB: number;
  /** Â + B̂ en degrés. */
  somme: number;
  /** Â + B̂ < 180° : le candidat donne un triangle. */
  valide: boolean;
}

export interface TriangleSSA {
  rang: 1 | 2;
  angleB: number;
  /** Ĉ = 180° − Â − B̂. */
  angleC: number;
  /** c = AB = a · sin Ĉ / sin Â. */
  c: number;
}

export interface ResolutionSSA {
  sinB: number;
  comparaison: ComparaisonSinusSSA;
  /** 0 candidat (sin B̂ > 1), 1 (sin B̂ = 1) ou 2 (sin B̂ < 1). */
  candidats: CandidatSSA[];
  triangles: TriangleSSA[];
  nombreTriangles: 0 | 1 | 2;
  /** Distance de C à la droite (Ax) : h = b · sin Â — la plus petite valeur de a qui donne un triangle (Â aigu). */
  hauteur: number;
}

export function sinDeg(x: number): number {
  return Math.sin(x * D2R);
}

export function cosDeg(x: number): number {
  return Math.cos(x * D2R);
}

export function sinusB(d: DonneesSSA): number {
  return (d.b * sinDeg(d.angleA)) / d.a;
}

export function comparerSinusSSA(sinB: number): ComparaisonSinusSSA {
  if (Math.abs(sinB - 1) <= EPS) return "egal";
  return sinB > 1 ? "superieur" : "inferieur";
}

export function resoudreSSA(d: DonneesSSA): ResolutionSSA {
  const sinB = sinusB(d);
  const comparaison = comparerSinusSSA(sinB);
  const angles = comparaison === "superieur" ? [] : comparaison === "egal" ? [90] : [Math.asin(sinB) / D2R, 180 - Math.asin(sinB) / D2R];
  const candidats: CandidatSSA[] = angles.map((angleB, i) => {
    const somme = d.angleA + angleB;
    return { rang: (i + 1) as 1 | 2, angleB, somme, valide: somme < 180 - EPS };
  });
  const triangles: TriangleSSA[] = candidats
    .filter((cand) => cand.valide)
    .map((cand) => {
      const angleC = 180 - d.angleA - cand.angleB;
      return { rang: cand.rang, angleB: cand.angleB, angleC, c: (d.a * sinDeg(angleC)) / sinDeg(d.angleA) };
    });
  return { sinB, comparaison, candidats, triangles, nombreTriangles: triangles.length as 0 | 1 | 2, hauteur: d.b * sinDeg(d.angleA) };
}

/** Point de la droite (Ax) atteint par le cercle de centre C et de rayon a : abscisse, et s'il est
 * sur la demi-droite [Ax) (abscisse > 0) — sinon il est « derrière » A et ne donne aucun triangle. */
export interface IntersectionSSA {
  x: number;
  surDemiDroite: boolean;
}

/** Sommet C dans le repère de la figure (A à l'origine, [Ax) sur les abscisses positives). */
export function sommetC(d: DonneesSSA): { x: number; y: number } {
  return { x: d.b * cosDeg(d.angleA), y: d.b * sinDeg(d.angleA) };
}

/** Intersections du cercle (C ; a) avec la droite (Ax), de la plus à droite à la plus à gauche :
 * aucune si a < h, une seule (tangence) si a = h, deux sinon. L'abscisse d'un point sur la
 * demi-droite vaut le côté c du triangle correspondant (B̂₁ pour la plus à droite). */
export function intersectionsSSA(d: DonneesSSA): IntersectionSSA[] {
  const { x: cx, y: cy } = sommetC(d);
  const disc = d.a * d.a - cy * cy;
  if (disc < -EPS) return [];
  if (Math.abs(disc) <= EPS) return [{ x: cx, surDemiDroite: cx > EPS }];
  const r = Math.sqrt(disc);
  return [cx + r, cx - r].map((x) => ({ x, surDemiDroite: x > EPS }));
}
