/**
 * Construction des composantes en `x` (`LinExpr`) — module frère, partagé par les variantes
 * "parametre" et "pointsParametre" (via `pointDepuisVecteur`-like addition, voir `index.ts`).
 *
 * **Garantit toujours une réduction du 1er degré** (jamais de cas quadratique) en construisant un
 * "vecteur variable" (au moins une composante dépend de `x`) et un "vecteur fixe" (purement
 * numérique) séparément, puis en calculant le critère entre les deux — un produit où au plus un
 * facteur dépend de `x` reste toujours linéaire, quel que soit le nombre de composantes du vecteur
 * variable qui dépendent effectivement de `x` (1 ou 2).
 */
import type { Composantes } from "../../core/vecteur.types";
import type { ComposantesLin, LinExpr, TypeSolutionColinearite } from "../../core/colinearite.types";
import { randomInt } from "./aleatoire";

export function evalLin(expr: LinExpr, x: number): number {
  return expr.coefX * x + expr.constante;
}

export function composantesLinEvaluees(v: ComposantesLin, x: number): Composantes {
  return { x: evalLin(v.x, x), y: evalLin(v.y, x) };
}

/** `-0` produit par une soustraction qui s'annule exactement — jamais affiché "-0" à l'élève,
 * même précaution que `normaliserZero` (exercice "tableau de signes"). */
function normaliserZero(valeur: number): number {
  return valeur === 0 ? 0 : valeur;
}

/** Cible `coefX·x + coefConst = 0` — tirée AVANT toute construction de composantes (jamais un
 * tirage de vecteurs suivi d'une classification a posteriori). Depuis
 * `promptcorrectionsgenerateur24lot3.md`, point 2, les deux appelants ("parametre" ET
 * "pointsParametre") forcent toujours `typeSolution="unique"` — les branches
 * `identite`/`contradiction` restent ici uniquement pour rester structurellement complètes sur le
 * type `TypeSolutionColinearite`, jamais atteintes en pratique (`tirerTypeSolution`, qui les
 * tirait, a été retirée comme code mort). */
function construireCibleEquation(typeSolution: TypeSolutionColinearite): { coefX: number; coefConst: number; solutionX: number | null } {
  if (typeSolution === "identite") {
    return { coefX: 0, coefConst: 0, solutionX: null };
  }
  if (typeSolution === "contradiction") {
    let coefConst = 0;
    while (coefConst === 0) coefConst = randomInt(-6, 6);
    return { coefX: 0, coefConst, solutionX: null };
  }
  let coefX = 0;
  while (coefX === 0) coefX = randomInt(-4, 4);
  const solutionX = randomInt(-4, 4);
  return { coefX, coefConst: -coefX * solutionX, solutionX };
}

export interface VecteurAvecXConstruit {
  vecteurVariable: ComposantesLin;
  vecteurFixe: Composantes;
  coefX: number;
  coefConst: number;
  typeSolution: TypeSolutionColinearite;
  solutionX: number | null;
}

/**
 * Construit un couple (vecteur variable en `x`, vecteur fixe) dont le critère
 * `variable.x·fixe.y - variable.y·fixe.x` se réduit EXACTEMENT à `coefX·x + coefConst` — jamais
 * recalculé après coup, la cible pilote la construction (voir `construireCibleEquation`).
 *
 * Le vecteur fixe a toujours l'une de ses deux composantes égale à `±1` (`xEstUnite` choisit
 * laquelle) — permet de résoudre le système à 2 inconnues (`a1,a2` ou `b1,b2`) par simple
 * substitution, sans division, tout en gardant `a2` (la composante en x qui multiplie l'unité)
 * toujours non nulle : le vecteur variable dépend donc TOUJOURS réellement de `x`, même dans les
 * cas dégénérés (`coefX=0`) où le critère lui-même s'annule identiquement — sans cette garantie,
 * un exercice "identité"/"contradiction" pourrait dégénérer en deux vecteurs simplement constants,
 * sans aucun `x` en jeu, ce qui viderait l'exercice de son sens.
 */
export function construireVecteurAvecX(typeSolution: TypeSolutionColinearite): VecteurAvecXConstruit {
  const { coefX, coefConst, solutionX } = construireCibleEquation(typeSolution);
  const xEstUnite = Math.random() < 0.5;

  let vecteurVariable: ComposantesLin;
  let vecteurFixe: Composantes;

  if (xEstUnite) {
    // fixe = (1, e) — critère = (a1x+b1)*e - (a2x+b2)*1 = (a1*e-a2)x + (b1*e-b2).
    // a1 (libre, jamais nul) garantit à lui seul que le vecteur variable dépend réellement de x,
    // quelle que soit la valeur dérivée de a2 (qui peut légitimement tomber à 0).
    let e = 0;
    while (e === 0) e = randomInt(-4, 4);
    let a1 = 0;
    while (a1 === 0) a1 = randomInt(-3, 3);
    const b1 = randomInt(-3, 3);
    const a2 = a1 * e - coefX;
    const b2 = b1 * e - coefConst;
    vecteurVariable = { x: { coefX: a1, constante: b1 }, y: { coefX: a2, constante: b2 } };
    vecteurFixe = { x: 1, y: e };
  } else {
    // fixe = (c, 1) — critère = (a1x+b1)*1 - (a2x+b2)*c = (a1-a2*c)x + (b1-b2*c).
    // a2 (libre, jamais nul) garantit ici la même chose, en miroir.
    let c = 0;
    while (c === 0) c = randomInt(-4, 4);
    let a2 = 0;
    while (a2 === 0) a2 = randomInt(-3, 3);
    const b2 = randomInt(-3, 3);
    const a1 = coefX + a2 * c;
    const b1 = coefConst + b2 * c;
    vecteurVariable = { x: { coefX: a1, constante: b1 }, y: { coefX: a2, constante: b2 } };
    vecteurFixe = { x: c, y: 1 };
  }

  return { vecteurVariable, vecteurFixe, coefX: normaliserZero(coefX), coefConst: normaliserZero(coefConst), typeSolution, solutionX };
}
