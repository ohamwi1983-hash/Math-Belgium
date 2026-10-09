import type { ExerciceFamilleB, ValeurComplexe } from "../../core6e/equationsComplexes.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille B ("Équation rationnelle en z") de `6gen36`.
 * (az+b)/(cz+d)=k, a,b,c,d RÉELS entiers, k complexe, c≠0. Multiplication en croix :
 * az+b=k(cz+d)=(kc)z+kd — équation développée linéaire en z, à coefficients complexes kc,kd.
 * Isolée : (a-kc)z=kd-b, z=(kd-b)/(a-kc).
 *
 * ============================================================================
 * **Construction À L'ENVERS depuis un z CIBLE — pourquoi `k.im=±1` est le VERROU qui garantit
 * a,b,c,d,z tous entiers exacts**
 * ============================================================================
 * On tire d'abord a,c (c≠0),k, ET le z cible (tous Gaussiens/réels entiers), puis on calcule
 * w=(a-kc)·z et on résout kd=b+w pour les 2 INCONNUES RÉELLES b,d (2 équations réelles, partie
 * réelle et partie imaginaire de kd=b+w séparément, puisque b et d doivent tous 2 rester réels) :
 *   k.im·d = Im(w)  ⟹  d = Im(w)/k.im
 *   k.re·d = b+Re(w)  ⟹  b = k.re·d - Re(w)
 * `d` n'est un entier EXACT que si `k.im` divise `Im(w)` — jamais garanti pour un k.im
 * quelconque. En restreignant `k.im` à ±1 (division par ±1 TOUJOURS exacte), `d` puis `b` sont
 * TOUJOURS des entiers exacts, quels que soient a,c,k.re,z par ailleurs — jamais une coïncidence,
 * une propriété ALGÉBRIQUE garantie par construction. `k.re` reste libre (y compris 0) : k garde
 * une partie imaginaire non nulle (`k.im=±1`), condition suffisante pour que a-kc soit non nul
 * (a réel, kc a une partie imaginaire non nulle puisque c≠0 et k.im≠0).
 */

const COEF_MIN = -6;
const COEF_MAX = 6;
const Z_MIN = -5;
const Z_MAX = 5;

function multiplierGaussien(u: ValeurComplexe, v: ValeurComplexe): ValeurComplexe {
  return { re: u.re * v.re - u.im * v.im, im: u.re * v.im + u.im * v.re };
}

export function construireFamilleB(): ExerciceFamilleB {
  const a = tirerEntierNonNul(COEF_MIN, COEF_MAX);
  const c = tirerEntierNonNul(COEF_MIN, COEF_MAX);
  const k: ValeurComplexe = { re: tirerEntier(-4, 4), im: tirerParmi([-1, 1] as const) };
  const z: ValeurComplexe = { re: tirerEntierNonNul(Z_MIN, Z_MAX), im: tirerEntierNonNul(Z_MIN, Z_MAX) };

  const kc: ValeurComplexe = { re: k.re * c, im: k.im * c };
  const denom: ValeurComplexe = { re: a - kc.re, im: -kc.im };
  const w = multiplierGaussien(denom, z);

  const d = w.im / k.im; // toujours entier exact, voir en-tête de fichier.
  const b = k.re * d - w.re;
  const kd: ValeurComplexe = { re: k.re * d, im: k.im * d };

  return { famille: "B", a, b, c, d, k, kc, kd, z };
}
