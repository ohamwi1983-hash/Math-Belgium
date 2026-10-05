/**
 * Couche A (5e) — famille 4 de l'extension 5gen10 ("Égalité de deux expressions trigonométriques
 * avec conversion", voir CLAUDE.md section 5gen10 "Extension — 4 familles"). SIMPLIFICATION assumée
 * (documentée) : 3 identités canoniques à UN SEUL pas de conversion (jamais de chaîne à plusieurs
 * pas), et les écrans "appliquer l'identité"/"isoler x" de la spec sont FUSIONNÉS en un seul (les
 * branches finales en x sont calculées directement ici, jamais une équation intermédiaire à x des
 * deux côtés).
 *
 * `a1 > a2 > 0` GARANTI par construction (jamais un a1-a2 négatif à gérer) : les diviseurs (a1+a2)/
 * (a1-a2) des 2 branches restent donc TOUJOURS strictement positifs, cohérent avec la convention du
 * reste du module (`CoefficientRationnel` toujours positif, `RationnelPi.denominateur` toujours >0).
 * `b1`/`b2` TOUJOURS en régime EXACT (fraction de π, `tirerB("exact")`) — jamais décimal ici,
 * simplification qui garde toutes les branches finales en fractions de π propres.
 */
import type { BrancheX, CoefficientRationnel, ExerciceEgaliteExpressions, IdentiteEgalite, RationnelPi, ValeurPiOuDecimale } from "../../core5e/equationsTrigonometriques.types";
import { additionnerRationnelPi, negatifRationnelPi, valeurNumerique } from "../parametresSinusoide/rationnelPi";
import { tirerA, tirerB } from "./coefficients";
import { diviserValeurParA, solutionsDistinctes } from "./solveur";

const IDENTITES: IdentiteEgalite[] = ["cosVersCos", "sinVersSin", "tanVersTan"];

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Somme de 2 `CoefficientRationnel` (tous deux garantis positifs par l'appelant), réduite. */
function sommeCoefficients(a: CoefficientRationnel, b: CoefficientRationnel): CoefficientRationnel {
  const numerateur = a.numerateur * b.denominateur + b.numerateur * a.denominateur;
  const denominateur = a.denominateur * b.denominateur;
  const g = pgcd(numerateur, denominateur);
  return { numerateur: numerateur / g, denominateur: denominateur / g };
}

/** Différence a-b (a>b garanti par l'appelant, donc toujours strictement positive), réduite. */
function differenceCoefficients(a: CoefficientRationnel, b: CoefficientRationnel): CoefficientRationnel {
  const numerateur = a.numerateur * b.denominateur - b.numerateur * a.denominateur;
  const denominateur = a.denominateur * b.denominateur;
  const g = pgcd(numerateur, denominateur);
  return { numerateur: numerateur / g, denominateur: denominateur / g };
}

/** Tire a1>a2>0 (2 valeurs distinctes de `tirerA()`, la plus grande assignée à a1) — élimine
 * structurellement tout diviseur négatif dans les branches dérivées. */
function tirerA1EtA2(): [CoefficientRationnel, CoefficientRationnel] {
  let v1 = tirerA();
  let v2 = tirerA();
  let d1 = v1.numerateur / v1.denominateur;
  let d2 = v2.numerateur / v2.denominateur;
  while (d1 === d2) {
    v2 = tirerA();
    d2 = v2.numerateur / v2.denominateur;
  }
  return d1 > d2 ? [v1, v2] : [v2, v1];
}

const DEMI_PI: RationnelPi = { numerateur: 1, denominateur: 2, degrePi: 1 };

function exacte(v: RationnelPi): ValeurPiOuDecimale {
  return { exact: v, decimal: valeurNumerique(v) };
}

/** π/2 - b1 - b2, utilisée par les branches "+" de cosVersCos/sinVersSin. */
function demiPiMoinsB1MoinsB2(b1: RationnelPi, b2: RationnelPi): RationnelPi {
  return additionnerRationnelPi(additionnerRationnelPi(DEMI_PI, negatifRationnelPi(b1)), negatifRationnelPi(b2));
}

const MAX_SOLUTIONS = 5;
const TENTATIVES_MAX = 200;

function construireBranches(identite: IdentiteEgalite, a1: CoefficientRationnel, a2: CoefficientRationnel, b1: RationnelPi, b2: RationnelPi): BrancheX[] {
  const somme = sommeCoefficients(a1, a2);
  const diff = differenceCoefficients(a1, a2);

  if (identite === "tanVersTan") {
    // x = (-b1-b2+nπ)/(a1+a2)
    const constanteNum = additionnerRationnelPi(negatifRationnelPi(b1), negatifRationnelPi(b2));
    const periodeNum: RationnelPi = { numerateur: 1, denominateur: 1, degrePi: 1 };
    return [{ constante: diviserValeurParA(exacte(constanteNum), somme), periode: diviserValeurParA(exacte(periodeNum), somme) }];
  }

  const periodeNum: RationnelPi = { numerateur: 2, denominateur: 1, degrePi: 1 };
  // Branche "+" (commune aux 2 identités) : x = (π/2-b1-b2+2nπ)/(a1+a2).
  const branchePlus: BrancheX = {
    constante: diviserValeurParA(exacte(demiPiMoinsB1MoinsB2(b1, b2)), somme),
    periode: diviserValeurParA(exacte(periodeNum), somme),
  };
  // Branche "-" : diffère entre cosVersCos (A=-Bconv+2nπ) et sinVersSin (A=π-Bconv+2nπ).
  const constanteMoinsNum =
    identite === "cosVersCos"
      ? additionnerRationnelPi(additionnerRationnelPi(negatifRationnelPi(DEMI_PI), negatifRationnelPi(b1)), b2)
      : additionnerRationnelPi(additionnerRationnelPi(DEMI_PI, b2), negatifRationnelPi(b1));
  const brancheMoins: BrancheX = {
    constante: diviserValeurParA(exacte(constanteMoinsNum), diff),
    periode: diviserValeurParA(exacte(periodeNum), diff),
  };
  return [branchePlus, brancheMoins];
}

export function construireExerciceEgaliteExpressions(): ExerciceEgaliteExpressions {
  const identite = IDENTITES[Math.floor(Math.random() * IDENTITES.length)];
  const b1Valeur = tirerB("exact");
  const b2Valeur = tirerB("exact");
  const b1 = b1Valeur.exact as RationnelPi;
  const b2 = b2Valeur.exact as RationnelPi;

  let [a1, a2] = tirerA1EtA2();
  let branches = construireBranches(identite, a1, a2, b1, b2);
  let solutions = solutionsDistinctes(branches);
  let tentative = 0;
  // Reroll BORNÉ de (a1,a2) seuls (jamais identite/b1/b2) tant que le nombre de solutions dépasse 5
  // ou tombe à 0 — même principe que la famille "directe" (voir `index.ts`).
  while ((solutions.length > MAX_SOLUTIONS || solutions.length === 0) && tentative < TENTATIVES_MAX) {
    [a1, a2] = tirerA1EtA2();
    branches = construireBranches(identite, a1, a2, b1, b2);
    solutions = solutionsDistinctes(branches);
    tentative++;
  }

  return { famille: "egalite", identite, a1, b1: b1Valeur, a2, b2: b2Valeur, branches, solutions };
}
