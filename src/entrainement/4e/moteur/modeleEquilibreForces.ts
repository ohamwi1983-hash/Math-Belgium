import type { ExerciceEquilibreForces, Vecteur2 } from "../core/equilibreForces.types";

/**
 * Modèle de gen90 : une seule source pour l'écran, les aides, la vérification et l'adaptateur de
 * feuilles. Les vecteurs de l'exercice sont en unités entières ; tout ce qui est exposé ici est en
 * NEWTONS (`fN`, `resultante`, `f3`…).
 */

/** −0 → 0 (affichage « 0 », jamais « −0 »). */
function net(n: number): number {
  return n === 0 ? 0 : n;
}

export function vecteurN(e: ExerciceEquilibreForces, v: Vecteur2): Vecteur2 {
  return { x: net(v.x * e.unite), y: net(v.y * e.unite) };
}

/** F₃ en unités : −(F₁ + F₂). */
export function f3Unites(e: ExerciceEquilibreForces): Vecteur2 {
  return { x: net(-(e.f1.x + e.f2.x)), y: net(-(e.f1.y + e.f2.y)) };
}

export function f1(e: ExerciceEquilibreForces): Vecteur2 {
  return vecteurN(e, e.f1);
}

export function f2(e: ExerciceEquilibreForces): Vecteur2 {
  return vecteurN(e, e.f2);
}

/** Résultante F₁ + F₂ (N). */
export function resultante(e: ExerciceEquilibreForces): Vecteur2 {
  return { x: net(f1(e).x + f2(e).x), y: net(f1(e).y + f2(e).y) };
}

/** Force d'équilibre F₃ = −(F₁ + F₂) (N). */
export function f3(e: ExerciceEquilibreForces): Vecteur2 {
  return vecteurN(e, f3Unites(e));
}

export function norme(v: Vecteur2): number {
  return Math.hypot(v.x, v.y);
}

/** Carré de l'intensité de F₃ (entier, en N²). */
export function normeCarreeF3(e: ExerciceEquilibreForces): number {
  const v = f3(e);
  return v.x * v.x + v.y * v.y;
}

export function intensiteF3(e: ExerciceEquilibreForces): number {
  return norme(f3(e));
}

/** √n = k√m avec m sans facteur carré. */
export function simplifierRacine(n: number): { k: number; m: number } {
  let k = 1;
  let m = n;
  for (let d = 2; d * d <= m; d++) {
    while (m % (d * d) === 0) {
      m /= d * d;
      k *= d;
    }
  }
  return { k, m };
}

/** Intensité demandée exacte (entier, racine, axe) ou arrondie au dixième. */
export function intensiteExacteDemandee(e: ExerciceEquilibreForces): boolean {
  return e.intensite !== "arrondi";
}

export function intensiteArrondie(e: ExerciceEquilibreForces): number {
  return Math.round(intensiteF3(e) * 10) / 10;
}

/** Angle aigu (degrés) entre la direction de F₃ et l'axe x : tan α = |y| / |x|. */
export function angleF3(e: ExerciceEquilibreForces): number {
  const v = f3(e);
  return (Math.atan2(Math.abs(v.y), Math.abs(v.x)) * 180) / Math.PI;
}

export function angleArrondi(e: ExerciceEquilibreForces): number {
  return Math.round(angleF3(e) * 10) / 10;
}

/** Nombre d'écrans : condition, résultante, F₃, intensité (+ direction). */
export function nombreEcrans(e: ExerciceEquilibreForces): number {
  return e.direction ? 5 : 4;
}

export const ECRAN_CONDITION = 0;
export const ECRAN_RESULTANTE = 1;
export const ECRAN_F3 = 2;
export const ECRAN_INTENSITE = 3;
export const ECRAN_DIRECTION = 4;

/** Somme des intensités ‖F₁‖ + ‖F₂‖ (piège « additionner les intensités »). */
export function sommeIntensites(e: ExerciceEquilibreForces): number {
  return norme(f1(e)) + norme(f2(e));
}

/** Angle (en degrés) entre deux vecteurs non nuls. */
export function angleEntre(u: Vecteur2, v: Vecteur2): number {
  const c = (u.x * v.x + u.y * v.y) / (norme(u) * norme(v));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}
