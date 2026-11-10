/**
 * Couche A (5e) — famille "formeIndeterminee" (0/0) de 5gen20. N(x)=kN·(x-a)·(x-p),
 * D(x)=kD·(x-a)·(x-q), un facteur (x-a) commun. Construction en arithmétique ENTIÈRE : la vérité
 * terrain structurelle (a, kDbase, j, la fraction cible num/den) est choisie EN PREMIER, `p`/`q`/`kN`
 * en sont dérivés de sorte que la limite simplifiée retombe EXACTEMENT sur `num/den`, jamais un
 * rejet/régénération — preuve algébrique dans le corps de `genererExerciceFormeIndeterminee`.
 */
import type { ExerciceLimiteFormeIndeterminee } from "../../core5e/limites.types";
import { entierAleatoire, entierNonNul, reduireFraction } from "./fraction";

/** Plus grand coefficient (en valeur absolue) des polynômes développés affichés à l'élève. */
const COEFFICIENT_MAX = 30;

/** Tirages rejetés (audit 5c4a point 3) : p = q (les deux facteurs (x-p) et (x-q) se simplifient
 * aussi, la fonction simplifiée est constante — 19 % des tirages avant correction) et coefficients
 * développés au-delà de 30 en valeur absolue (31 %). */
export function genererExerciceFormeIndeterminee(): ExerciceLimiteFormeIndeterminee {
  for (let essai = 0; essai < 200; essai++) {
    const exercice = genererExerciceFormeIndetermineeBrut();
    const coeffs = [
      exercice.kN * exercice.a * exercice.p, exercice.kN * (exercice.a + exercice.p), exercice.kN,
      exercice.kD * exercice.a * exercice.q, exercice.kD * (exercice.a + exercice.q), exercice.kD,
    ];
    if (exercice.p !== exercice.q && coeffs.every((c) => Math.abs(c) <= COEFFICIENT_MAX)) return exercice;
  }
  return genererExerciceFormeIndetermineeBrut();
}

function genererExerciceFormeIndetermineeBrut(): ExerciceLimiteFormeIndeterminee {
  const a = entierAleatoire(-4, 4);

  // Fraction cible num/den — 50% entier (den=1), sinon den∈{2,3} avec num non multiple de den
  // (nudge déterministe +1, jamais de rejet/reroll complet).
  let num: number;
  let den: number;
  if (Math.random() < 0.5) {
    num = entierNonNul(6);
    den = 1;
  } else {
    den = Math.random() < 0.5 ? 2 : 3;
    num = entierAleatoire(-2 * den, 2 * den);
    if (num === 0 || num % den === 0) num += 1;
  }

  const kDbase = entierNonNul(2);
  const j = entierNonNul(2);
  // d1=a-p, d2=a-q — la limite kN·d1/(kD·d2) avec kN=num, kD=kDbase, d1=kDbase·j, d2=den·j vaut
  // TOUJOURS exactement num/den (kDbase et j se simplifient dans le rapport) :
  //   (num·kDbase·j) / (kDbase·den·j) = num/den.
  const d1 = kDbase * j;
  const d2 = den * j;
  const p = a - d1;
  const q = a - d2;

  return { famille: "formeIndeterminee", a, kN: num, p, kD: kDbase, q, limite: reduireFraction(num, den) };
}
