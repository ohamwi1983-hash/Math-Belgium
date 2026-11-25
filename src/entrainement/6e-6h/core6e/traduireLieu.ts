import type { D, Poly, Pt } from "../ui6e/outilsLieuxLotH2";
import { dist2, intersection, mediatrice, milieu, normaliserDroite, perpendiculaire, pointsArc, polyDiametre, polyDroite, polyProduit } from "../ui6e/outilsLieuxLotH2";

/**
 * Couche core — `6gen128` « Traduire un lieu : réciproque et points exclus » (6e ch. 9, § 4, processus 3
 * TRANSFÉRER). Une condition géométrique NOUVELLE (non couverte par 6gen56) se traduit en une équation
 * en (x ; y) : c'est le lieu COMPLET ; la réciproque dit ensuite quels points de cet ensemble ne
 * conviennent pas (triangle aplati, corde réduite à un point, cercle de rayon nul).
 *
 * VERDICT = nombre de points exclus (0, 1 ou 2), tiré EN PREMIER à parts égales, puis la situation
 * (dans la variante) qui le réalise :
 * - variante `cercle` (le lieu complet est un cercle) : 0 → PA² + PB² = AB² ou milieu de [MQ], M
 *   extérieur au cercle parcouru ; 1 → milieu d'une corde [MQ] qui pivote autour de M (I ≠ M) ;
 *   2 → triangle APB rectangle en P (cercle de diamètre [AB] privé de A et B) ;
 * - variante `droites` (droite ou réunion de deux droites) : 0 → centres des cercles passant par A et
 *   B, ou points à la distance h d'une droite ; 1 → triangle PAB isocèle en P (médiatrice privée du
 *   milieu de [AB]), ou centres des cercles tangents à deux droites sécantes (bissectrices privées de
 *   leur point commun) ; 2 → triangle PAB rectangle en A ou en B (perpendiculaires à (AB) en A et en
 *   B, privées de A et de B).
 * Le même ensemble apparaît avec des verdicts différents (cercle de diamètre [AB] : 0 ou 2 ; médiatrice :
 * 0 ou 1) : c'est la condition, pas l'équation, qui décide.
 */

export type VarianteTL = "cercle" | "droites";
export type SituationTL = "pythagore" | "milieuExt" | "corde" | "thales" | "mediatrice" | "distance" | "isocele" | "bissectrices" | "rectangleAB";
export type RaisonTL = "aplati" | "corde" | "rayon" | "hors";
export type PhaseTL = "equation" | "nombre" | "points" | "raison";

export interface ExerciceTL {
  variante: VarianteTL;
  nbExclus: 0 | 1 | 2;
  situation: SituationTL;
  /** Points A et B (pythagore, thales, mediatrice, isocele, rectangleAB). */
  A: Pt;
  B: Pt;
  /** Cercle parcouru (milieuExt, corde) : centre O, rayon r ; point fixe M. */
  O: Pt;
  r: number;
  M: Pt;
  /** Droite d (distance) et distance h ; droites d1, d2 (bissectrices). */
  d: D;
  h: number;
  d1: D;
  d2: D;
}

export const phases = (e: ExerciceTL): PhaseTL[] => (e.nbExclus === 0 ? ["equation", "nombre"] : ["equation", "nombre", "points", "raison"]);

/** Nom du point mobile. */
export function mobile(e: ExerciceTL): string {
  if (e.situation === "milieuExt" || e.situation === "corde") return "I";
  if (e.situation === "mediatrice" || e.situation === "bissectrices") return "\\Omega";
  return "P";
}
export const mobileTexte = (e: ExerciceTL): string => (mobile(e) === "\\Omega" ? "Ω" : mobile(e));

/** Norme du vecteur normal de d (distance) : 5 ou 1. */
export const normeD = (d: D): number => Math.round(Math.sqrt(d.a * d.a + d.b * d.b));

/** Les droites du lieu complet (variante `droites`). */
export function droitesLieu(e: ExerciceTL): D[] {
  switch (e.situation) {
    case "mediatrice":
    case "isocele":
      return [mediatrice(e.A, e.B)];
    case "distance": {
      const n = normeD(e.d);
      return [normaliserDroite({ ...e.d, c: e.d.c - n * e.h }), normaliserDroite({ ...e.d, c: e.d.c + n * e.h })];
    }
    case "bissectrices": {
      // d1 et d2 ont des vecteurs normaux de même norme : L1 − L2 = 0 et L1 + L2 = 0.
      const L1 = e.d1;
      const L2 = e.d2;
      return [normaliserDroite({ a: L1.a - L2.a, b: L1.b - L2.b, c: L1.c - L2.c }), normaliserDroite({ a: L1.a + L2.a, b: L1.b + L2.b, c: L1.c + L2.c })];
    }
    case "rectangleAB":
      return [perpendiculaire(e.A, e.B, e.A), perpendiculaire(e.A, e.B, e.B)];
    default:
      return [];
  }
}

/** Cercle du lieu complet (variante `cercle`) : centre et rayon². */
export function cercleLieu(e: ExerciceTL): { c: Pt; r2: number } {
  if (e.situation === "milieuExt" || e.situation === "corde") return { c: milieu(e.O, e.M), r2: (e.r * e.r) / 4 };
  return { c: milieu(e.A, e.B), r2: dist2(e.A, e.B) / 4 };
}

/** Équation attendue du lieu complet (polynôme = 0). */
export function polyLieu(e: ExerciceTL): Poly {
  if (e.variante === "cercle") {
    if (e.situation === "milieuExt" || e.situation === "corde") {
      const a = e.M.x + e.O.x;
      const b = e.M.y + e.O.y;
      return { x2: 1, y2: 1, x: -a, y: -b, "1": (a * a + b * b - e.r * e.r) / 4 };
    }
    return polyDiametre(e.A, e.B);
  }
  const ds = droitesLieu(e);
  return ds.length === 1 ? polyDroite(ds[0]!) : polyProduit(ds[0]!, ds[1]!);
}

/** Point commun de d1 et d2 (bissectrices). */
export const pointK = (e: ExerciceTL): Pt => intersection(e.d1, e.d2)!;

export function exclus(e: ExerciceTL): Pt[] {
  switch (e.situation) {
    case "corde":
      return [e.M];
    case "thales":
    case "rectangleAB":
      return [e.A, e.B];
    case "isocele":
      return [milieu(e.A, e.B)];
    case "bissectrices":
      return [pointK(e)];
    default:
      return [];
  }
}

export function raison(e: ExerciceTL): RaisonTL | null {
  switch (e.situation) {
    case "corde":
      return "corde";
    case "thales":
    case "rectangleAB":
    case "isocele":
      return "aplati";
    case "bissectrices":
      return "rayon";
    default:
      return null;
  }
}

/** Points de l'ensemble attendu (contrôle « même ensemble ») et points hors de lui. */
export function pointsSur(e: ExerciceTL): Pt[] {
  if (e.variante === "cercle") {
    const { c, r2 } = cercleLieu(e);
    return pointsArc(c, Math.sqrt(r2), 0.3, 0.3 + 2 * Math.PI, 11);
  }
  const res: Pt[] = [];
  for (const d of droitesLieu(e)) {
    for (const s of [-3.3, -1.1, 0.7, 2.9]) {
      if (Math.abs(d.b) > 1e-9) res.push({ x: s, y: -(d.a * s + d.c) / d.b });
      else res.push({ x: -d.c / d.a, y: s });
    }
  }
  return res;
}

/** Points du plan à l'écart de l'ensemble attendu. */
export function pointsHors(_e: ExerciceTL): Pt[] {
  return [
    { x: 0.37, y: 2.91 },
    { x: -1.73, y: 0.58 },
    { x: 2.46, y: -1.19 },
    { x: -3.11, y: -2.47 },
    { x: 4.27, y: 3.63 },
    { x: 1.13, y: -3.82 },
  ];
}
