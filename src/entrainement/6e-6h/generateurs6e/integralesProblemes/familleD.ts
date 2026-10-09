import type { ExerciceFamilleD_Problemes } from "../../core6e/integralesProblemes.types";

/**
 * Couche A (6e) — famille D de `6gen29` : coût marginal/total/moyen. f(q)=a−b·q (coût marginal,
 * affine décroissant), coût fixe C(0)=F0. C(q) = a·q − b·q²/2 + F0 (primitive, constante=F0).
 *
 * b∈{0,05;0,08;0,1} — stocké en fraction EXACTE bNum/bDen (jamais un décimal, convention
 * CLAUDE.md) : 0,05=1/20, 0,08=2/25, 0,1=1/10.
 */

const OPTIONS_B: { num: number; den: number }[] = [
  { num: 1, den: 20 }, // 0,05
  { num: 2, den: 25 }, // 0,08
  { num: 1, den: 10 }, // 0,1
];

function entierEntre(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function construireFamilleD(): ExerciceFamilleD_Problemes {
  const a = entierEntre(10, 20);
  const { num: bNum, den: bDen } = OPTIONS_B[Math.floor(Math.random() * OPTIONS_B.length)];
  const F0 = entierEntre(50, 200);
  const q1 = entierEntre(10, 40);
  const q2 = q1 + entierEntre(10, 40);
  const b = bNum / bDen;
  const fReference = (q: number) => a - b * q;
  const CReference = (q: number) => a * q - (b * q * q) / 2 + F0;
  return { famille: "D", a, bNum, bDen, F0, q1, q2, fReference, CReference };
}

export function coutMarginalReference(ex: ExerciceFamilleD_Problemes): (q: number) => number {
  return ex.fReference;
}

export function coutTotalReference(ex: ExerciceFamilleD_Problemes): (q: number) => number {
  return ex.CReference;
}

export function coutMoyenReference(ex: ExerciceFamilleD_Problemes): (q: number) => number {
  return (q: number) => ex.CReference(q) / q;
}
