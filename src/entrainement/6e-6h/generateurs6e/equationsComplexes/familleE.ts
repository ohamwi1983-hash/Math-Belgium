import type { ExerciceFamilleE, ValeurComplexe } from "../../core6e/equationsComplexes.types";
import { tirerEntier, tirerEntierNonNul } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille E ("Quartique biquadratique u=z²") de `6gen36`.
 * az⁴+bz²+c=0 (aucun terme de degré impair), coefficients pouvant être complexes.
 *
 * ============================================================================
 * **Construction À L'ENVERS depuis 2 couples cibles (x1,y1),(x2,y2) — LE "truc x,y" de
 * `generateurs6e/affixesRacines/familleC.ts` (6gen35) appliqué 2 FOIS, une fois par valeur de u**
 * ============================================================================
 * Pour un couple d'entiers (x,y) (pas tous 2 nuls), poser u=(x+yi)²=x²-y²+2xy·i — TOUJOURS un
 * Gaussien entier exact dont x+yi EST une racine carrée EXACTE (par construction, jamais une
 * coïncidence à vérifier). Cette UNIQUE formule couvre les 3 cas de figure sans branchement
 * séparé : y=0 ⟹ u=x² réel positif (racines ±x réelles) ; x=0 ⟹ u=-y² réel négatif (racines ±yi
 * imaginaires pures) ; x,y≠0 ⟹ u complexe non réel (racines ±(x+yi) complexes) — voir en-tête de
 * `core6e/equationsComplexes.types.ts`.
 *
 * u1=(x1+y1i)², u2=(x2+y2i)² choisis ainsi (2 couples INDÉPENDANTS, u1≠u2 garanti en excluant le
 * couple (x2,y2)=(x1,y1) ET (x2,y2)=(-x1,-y1) — sinon u2=u1, équation en u dégénérée à racine
 * double). Coefficient dominant "aCoef" complexe (Gaussien entier, non nul) tiré indépendamment ;
 * bCoef=-aCoef(u1+u2), cCoef=aCoef·u1·u2 (mêmes coefficients pour l'équation en u ET pour
 * l'équation quartique de départ, puisque u=z² substitue directement u²→z⁴, u→z²).
 */

const XY_MIN = -4;
const XY_MAX = 4;
const A_MIN = -3;
const A_MAX = 3;

function multiplierGaussien(u: ValeurComplexe, v: ValeurComplexe): ValeurComplexe {
  return { re: u.re * v.re - u.im * v.im, im: u.re * v.im + u.im * v.re };
}
function ajouterGaussien(u: ValeurComplexe, v: ValeurComplexe): ValeurComplexe {
  return { re: u.re + v.re, im: u.im + v.im };
}

/** Tire un couple (x,y) entier, pas tous 2 nuls. */
function tirerCoupleXY(): { x: number; y: number } {
  let x = 0;
  let y = 0;
  do {
    x = tirerEntier(XY_MIN, XY_MAX);
    y = tirerEntier(XY_MIN, XY_MAX);
  } while (x === 0 && y === 0);
  return { x, y };
}

function racineCarreeGeneratrice(x: number, y: number): ValeurComplexe {
  return { re: x, im: y };
}
function carreDe(x: number, y: number): ValeurComplexe {
  return { re: x * x - y * y, im: 2 * x * y };
}

export function construireFamilleE(): ExerciceFamilleE {
  const c1 = tirerCoupleXY();
  let c2 = tirerCoupleXY();
  while ((c2.x === c1.x && c2.y === c1.y) || (c2.x === -c1.x && c2.y === -c1.y)) c2 = tirerCoupleXY();

  const racineU1 = racineCarreeGeneratrice(c1.x, c1.y);
  const racineU2 = racineCarreeGeneratrice(c2.x, c2.y);
  const u1 = carreDe(c1.x, c1.y);
  const u2 = carreDe(c2.x, c2.y);

  const aCoef: ValeurComplexe = { re: tirerEntierNonNul(A_MIN, A_MAX), im: tirerEntier(A_MIN, A_MAX) };
  const somme = ajouterGaussien(u1, u2);
  const b: ValeurComplexe = { re: -multiplierGaussien(aCoef, somme).re, im: -multiplierGaussien(aCoef, somme).im };
  const c = multiplierGaussien(aCoef, multiplierGaussien(u1, u2));

  const racines: [ValeurComplexe, ValeurComplexe, ValeurComplexe, ValeurComplexe] = [
    racineU1,
    { re: -racineU1.re, im: -racineU1.im },
    racineU2,
    { re: -racineU2.re, im: -racineU2.im },
  ];

  return { famille: "E", a: aCoef, b, c, u1, u2, racineU1, racineU2, racines };
}
