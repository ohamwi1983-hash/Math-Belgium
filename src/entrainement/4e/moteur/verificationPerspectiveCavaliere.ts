import type { ExercicePerspectiveCavaliere, PointDessin, SommetCavaliere } from "../core/perspectiveCavaliere.types";

/**
 * Vérification de gen104 — « Dessiner en perspective cavalière ». Le placement d'un sommet est
 * LIBRE (les sommets arrière ne tombent jamais sur un nœud du quadrillage, voir le générateur) :
 * - tolérance : `TOLERANCE_CM` autour de la position exacte ;
 * - aimant : un point posé dans la tolérance est ramené sur la position exacte (affichage et
 *   validation) — la longueur et l'angle lus sous la figure tombent alors juste.
 * Hors tolérance, un diagnostic reconnaît les pièges de la fiche : fuyante non réduite, fuyante
 * mesurée « un carreau en diagonale par centimètre », fuyante horizontale ou verticale, mauvais sens
 * de fuite ; pour le sommet S d'une pyramide : pied de la hauteur au milieu de [AB], hauteur
 * réduite, hauteur non verticale.
 */

export const TOLERANCE_CM = 0.25;
/** Rayon de reconnaissance d'une position-piège (un peu plus large que la tolérance). */
const RAYON_PIEGE_CM = 0.3;

export type DiagnosticSommet =
  | { code: "juste" }
  | { code: "echange"; autre: string }
  | { code: "non-reduite" }
  | { code: "diagonale-carreaux" }
  | { code: "horizontale" }
  | { code: "verticale" }
  | { code: "sens" }
  | { code: "longueur" }
  | { code: "angle" }
  | { code: "pied-avant" }
  | { code: "hauteur-reduite" }
  | { code: "pas-verticale" }
  | { code: "hauteur" };

export function distance(a: PointDessin, b: PointDessin): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function sommet(e: ExercicePerspectiveCavaliere, nom: string): SommetCavaliere {
  return e.sommets.find((s) => s.nom === nom)!;
}

/** Point de départ des mesures d'un sommet à construire : le sommet avant de sa fuyante, ou le
 * centre de la base (sommet d'une pyramide). */
export function origineMesure(e: ExercicePerspectiveCavaliere, nom: string): { nom: string; point: PointDessin } {
  const ref = sommet(e, nom).reference;
  if (ref?.type === "fuyante") return { nom: ref.depuis, point: sommet(e, ref.depuis).dessin };
  return { nom: "O", point: e.centreBase! };
}

/** Aimant : la position exacte si le point est dans la tolérance, sinon le point lui-même. */
export function aimanter(e: ExercicePerspectiveCavaliere, nom: string, p: PointDessin): PointDessin {
  const cible = sommet(e, nom).dessin;
  return distance(p, cible) <= TOLERANCE_CM ? { ...cible } : p;
}

/** Angle (degrés, ]−180 ; 180]) du vecteur u avec l'horizontale orientée vers la droite. */
export function angleDegres(u: PointDessin): number {
  return (Math.atan2(u.y, u.x) * 180) / Math.PI;
}

function ecartAngle(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Diagnostic d'un sommet placé. `autres` : sommets dont la position exacte est un échange possible
 * (les autres sommets à construire et les sommets déjà connus).
 */
export function diagnostiquerSommet(e: ExercicePerspectiveCavaliere, nom: string, p: PointDessin, autres: readonly string[] = []): DiagnosticSommet {
  const s = sommet(e, nom);
  if (distance(p, s.dessin) <= TOLERANCE_CM) return { code: "juste" };
  for (const autre of autres) {
    if (autre !== nom && distance(p, sommet(e, autre).dessin) <= TOLERANCE_CM) return { code: "echange", autre };
  }
  if (s.reference?.type === "hauteur") {
    const o = e.centreBase!;
    const milieuAB = { x: e.longueur / 2, y: 0 };
    if (distance(p, { x: milieuAB.x, y: milieuAB.y + e.hauteur }) <= RAYON_PIEGE_CM) return { code: "pied-avant" };
    if (distance(p, { x: o.x, y: o.y + e.hauteur / 2 }) <= RAYON_PIEGE_CM) return { code: "hauteur-reduite" };
    if (Math.abs(p.x - o.x) > TOLERANCE_CM) return { code: "pas-verticale" };
    return { code: "hauteur" };
  }
  const o = origineMesure(e, nom).point;
  const u = { x: p.x - o.x, y: p.y - o.y };
  const f = e.fuyante;
  if (distance(u, { x: 2 * f.x, y: 2 * f.y }) <= RAYON_PIEGE_CM) return { code: "non-reduite" };
  const demi = e.profondeur / 2;
  if (distance(u, { x: demi, y: demi }) <= RAYON_PIEGE_CM) return { code: "diagonale-carreaux" };
  if (Math.hypot(u.x, u.y) < 0.3) return { code: "longueur" };
  const theta = angleDegres(u);
  if (ecartAngle(theta, 45) <= 8) return { code: "longueur" };
  if (ecartAngle(theta, 0) <= 15 || ecartAngle(theta, 180) <= 15) return { code: "horizontale" };
  if (ecartAngle(theta, 90) <= 15 || ecartAngle(theta, -90) <= 15) return { code: "verticale" };
  if (u.x < 0 || u.y < 0) return { code: "sens" };
  return { code: "angle" };
}

export interface BilanAretes {
  correct: boolean;
  /** Arêtes cachées laissées en trait plein. */
  manquees: string[];
  /** Arêtes vues mises en pointillés. */
  enTrop: string[];
}

export function verifierAretes(e: ExercicePerspectiveCavaliere, pointillees: ReadonlySet<string>): BilanAretes {
  const manquees = e.aretes.filter((a) => a.cachee && !pointillees.has(a.cle)).map((a) => a.cle);
  const enTrop = e.aretes.filter((a) => !a.cachee && pointillees.has(a.cle)).map((a) => a.cle);
  return { correct: manquees.length === 0 && enTrop.length === 0, manquees, enTrop };
}
