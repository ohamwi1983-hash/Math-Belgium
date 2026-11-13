import type { Affine, ExerciceChantierTerrains, OutilVectoriel, PointPlan } from "../core/chantierTerrains.types";

/**
 * Modèle de gen88 : vecteurs utiles, critère, point cherché. Une seule source pour l'écran, les
 * aides, la vérification et l'adaptateur de feuilles. Critères tels qu'enseignés (sections
 * « colinéarité » et « orthogonalité ») : déterminant `x_u·y_v − y_u·x_v`, produit scalaire
 * `x_u·x_v + y_u·y_v`.
 */

export interface VecteurUtile {
  origine: string;
  extremite: string;
  x: Affine;
  y: Affine;
}

export const OUTIL_ATTENDU: Record<ExerciceChantierTerrains["situation"], OutilVectoriel> = {
  alignement: "colinearite",
  equerre: "orthogonalite",
  paralleles: "colinearite",
  milieu: "milieu",
  enclos: "egalite",
  piquet: "colinearite",
};

export function point(e: ExerciceChantierTerrains, nom: string): PointPlan {
  return e.points.find((p) => p.nom === nom)!;
}

const nombre = (n: number): Affine => ({ coef: 0, cst: n });

function vecteur(e: ExerciceChantierTerrains, de: string, a: string): VecteurUtile {
  const p = point(e, de);
  const q = point(e, a);
  return { origine: de, extremite: a, x: nombre(q.x - p.x), y: nombre(q.y - p.y) };
}

/** Piquet : la lettre de la coordonnée inconnue de P (« y » sur une ligne d'abscisse fixe). */
export function lettreInconnue(e: ExerciceChantierTerrains): "x" | "y" | null {
  if (!e.ligne) return null;
  return e.ligne.axe === "x" ? "y" : "x";
}

/** Vecteurs à calculer à l'écran 2, dans l'ordre. */
export function vecteursUtiles(e: ExerciceChantierTerrains): VecteurUtile[] {
  switch (e.situation) {
    case "alignement":
    case "equerre":
      return [vecteur(e, "A", "B"), vecteur(e, "A", "C")];
    case "paralleles":
      return [vecteur(e, "A", "B"), vecteur(e, "C", "D")];
    case "milieu":
    case "enclos":
      return [vecteur(e, "A", "B")];
    case "piquet": {
      const a = point(e, "A");
      const ligne = e.ligne!;
      const ap: VecteurUtile =
        ligne.axe === "x"
          ? { origine: "A", extremite: "P", x: nombre(ligne.valeur - a.x), y: { coef: 1, cst: -a.y } }
          : { origine: "A", extremite: "P", x: { coef: 1, cst: -a.x }, y: nombre(ligne.valeur - a.y) };
      return [vecteur(e, "A", "B"), ap];
    }
  }
}

function net(n: number): number {
  return n === 0 ? 0 : n;
}

/** Déterminant de deux vecteurs (affine en l'inconnue si l'un d'eux en dépend). */
export function determinant(u: VecteurUtile, v: VecteurUtile): Affine {
  // Un seul des deux vecteurs dépend de l'inconnue : le produit reste du premier degré.
  return {
    coef: net(u.x.cst * v.y.coef + u.x.coef * v.y.cst - (u.y.cst * v.x.coef + u.y.coef * v.x.cst)),
    cst: net(u.x.cst * v.y.cst - u.y.cst * v.x.cst),
  };
}

export function produitScalaire(u: VecteurUtile, v: VecteurUtile): number {
  return net(u.x.cst * v.x.cst + u.y.cst * v.y.cst);
}

/** Valeur du critère numérique de l'écran 3 (déterminant ou produit scalaire). */
export function valeurCritere(e: ExerciceChantierTerrains): number {
  const [u, v] = vecteursUtiles(e);
  return e.situation === "equerre" ? produitScalaire(u!, v!) : determinant(u!, v!).cst;
}

/** Milieu : composantes de AM = ½·AB. */
export function demiVecteur(e: ExerciceChantierTerrains): { x: number; y: number } {
  const [u] = vecteursUtiles(e);
  return { x: u!.x.cst / 2, y: u!.y.cst / 2 };
}

/** Piquet : équation du premier degré `coef·t + cst = 0` (déterminant de AB et AP nul). */
export function equationPiquet(e: ExerciceChantierTerrains): Affine {
  const [u, v] = vecteursUtiles(e);
  return determinant(u!, v!);
}

/** Valeur de l'inconnue du piquet. */
export function valeurInconnue(e: ExerciceChantierTerrains): number {
  const p = e.cherche!;
  return lettreInconnue(e) === "y" ? p.y : p.x;
}

export function norme(v: { x: number; y: number }): number {
  return Math.hypot(v.x, v.y);
}

/** Angle (en degrés, entre 0 et 180) entre deux vecteurs numériques. */
export function angleDegres(u: { x: number; y: number }, v: { x: number; y: number }): number {
  const c = (u.x * v.x + u.y * v.y) / (norme(u) * norme(v));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}
