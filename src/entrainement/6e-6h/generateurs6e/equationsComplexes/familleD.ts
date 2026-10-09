import type { ExerciceFamilleD, ValeurComplexe } from "../../core6e/equationsComplexes.types";
import { tirerEntier, tirerEntierNonNul } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille D ("Quadratique, discriminant complexe non réel") de
 * `6gen36`. az²+bz+c=0, a RÉEL entier non nul, b,c complexes, Δ=b²-4ac COMPLEXE NON RÉEL.
 *
 * ============================================================================
 * **Construction À L'ENVERS depuis 2 racines cibles z1,z2 — pourquoi √Δ tombe TOUJOURS exact,
 * SANS jamais avoir besoin du "truc x,y" de `familleC.ts` de 6gen35 (affixesRacines)**
 * ============================================================================
 * Pour 2 racines cibles z1,z2 (Gaussiennes entières) et un coefficient dominant "a" réel entier :
 *   a(z-z1)(z-z2) = a·z² - a(z1+z2)·z + a·z1z2   ⟹   b=-a(z1+z2), c=a·z1z2.
 * La formule quadratique donne z=(-b±√Δ)/(2a) ; en substituant -b=a(z1+z2), on identifie
 * directement √Δ = ±a(z1-z2) (pour que z=(a(z1+z2)±a(z1-z2))/(2a) retombe bien sur z1,z2). Donc :
 *   √Δ = a(z1-z2)  — un Gaussien entier EXACT, puisque a,z1,z2 le sont, PAR SIMPLE ARITHMÉTIQUE,
 * sans jamais passer par un couple (x,y) séparé — Δ=(a(z1-z2))² est ALGÉBRIQUEMENT un carré
 * parfait par construction (jamais une coïncidence à vérifier après coup). **Équivalence avec le
 * "truc x,y"** : poser X=a·Re(z1-z2), Y=a·Im(z1-z2) revient EXACTEMENT au même calcul que celui de
 * `generateurs6e/affixesRacines/familleC.ts` (6gen35) — Δ=(X+Yi)²=X²-Y²+2XYi, √Δ=±(X+Yi) — cette
 * famille D en est donc un cas d'application directe, paramétré via les racines plutôt que via
 * X,Y séparément.
 *
 * Δ est NON RÉEL ssi z1-z2 a une partie réelle ET une partie imaginaire toutes 2 non nulles (voir
 * `familleD.test.ts`, "Δ toujours non réel") — imposé DIRECTEMENT en tirant dx=Re(z1-z2),
 * dy=Im(z1-z2) NON NULS tous les 2, plutôt que z1,z2 indépendamment (qui pourrait accidentellement
 * produire une différence purement réelle/imaginaire — cas dégénéré à éviter).
 */

const A_MIN = -2;
const A_MAX = 2;
const CENTRE_MIN = -3;
const CENTRE_MAX = 3;
const D_MIN = -4;
const D_MAX = 4;

function multiplierGaussien(u: ValeurComplexe, v: ValeurComplexe): ValeurComplexe {
  return { re: u.re * v.re - u.im * v.im, im: u.re * v.im + u.im * v.re };
}
function ajouterGaussien(u: ValeurComplexe, v: ValeurComplexe): ValeurComplexe {
  return { re: u.re + v.re, im: u.im + v.im };
}

export function construireFamilleD(): ExerciceFamilleD {
  const a = tirerEntierNonNul(A_MIN, A_MAX);
  const centre: ValeurComplexe = { re: tirerEntier(CENTRE_MIN, CENTRE_MAX), im: tirerEntier(CENTRE_MIN, CENTRE_MAX) };
  const dx = tirerEntierNonNul(D_MIN, D_MAX);
  const dy = tirerEntierNonNul(D_MIN, D_MAX);

  const z2 = centre;
  const z1 = ajouterGaussien(centre, { re: dx, im: dy });

  const somme = ajouterGaussien(z1, z2);
  const b: ValeurComplexe = { re: -a * somme.re, im: -a * somme.im };
  const c: ValeurComplexe = { re: a * multiplierGaussien(z1, z2).re, im: a * multiplierGaussien(z1, z2).im };

  const b2 = multiplierGaussien(b, b);
  const quatreAc: ValeurComplexe = { re: 4 * a * c.re, im: 4 * a * c.im };
  const delta: ValeurComplexe = { re: b2.re - quatreAc.re, im: b2.im - quatreAc.im };

  const racineDelta1: ValeurComplexe = { re: a * dx, im: a * dy };
  const racineDelta2: ValeurComplexe = { re: -a * dx, im: -a * dy };

  return { famille: "D", a, b, c, delta, racinesDelta: [racineDelta1, racineDelta2], racines: [z1, z2] };
}
