/**
 * Couche A (5e) — scénario B de 5gen5 : coût unitaire de production. 5 MODÈLES (B1-B5) pour la forme
 * de cu(x)/F(x), tous linéaires en (a,b) une fois x fixé — `coeffA`/`coeffB` retournent les
 * coefficients de a/b dans F(x)=a·coeffA(x)+b·coeffB(x) (coût TOTAL), d'où cu(x)=F(x)/x. Cette seule
 * paire de fonctions couvre les 5 modèles sans dupliquer la logique de résolution/génération 5 fois.
 *
 * Les coûts unitaires révélés sont EXACTS (au plus 2 décimales — audit 5e ch. 1 : l'ancien arrondi à
 * l'entier faisait résoudre le système vers des (a, b) faux, négatifs ou nuls dans 14 % des B4). Le
 * tirage rejette donc tout couple de points dont le coût unitaire n'a pas une écriture décimale
 * courte ; le système de l'élève redonne alors exactement (aVrai, bVrai), entiers positifs.
 */
import type { ExerciceScenarioB, ModeleCoutUnitaire, PointRevele } from "../../core5e/problemesContexte.types";
import { CONTEXTES_B1, CONTEXTES_B2, CONTEXTES_B3, CONTEXTES_B4, CONTEXTES_B5 } from "./contextesScenarioB";
import { entierAleatoire, tirerElement } from "./utils";

// x ≥ 2 : « pour x = 1 puces » était agrammatical, et cu(1) = F(1) rendait un relevé trivial.
const X_CANDIDATS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const ECART_MIN_POINTS = 3;

const MODELES: ModeleCoutUnitaire[] = ["B1", "B2", "B3", "B4", "B5"];

/** Coefficient de "a" dans F(x)=a·coeffA(x)+b·coeffB(x) (coût TOTAL), par modèle. */
export function coeffA(modele: ModeleCoutUnitaire, x: number): number {
  switch (modele) {
    case "B1":
      return x;
    case "B2":
      return x;
    case "B3":
      return x;
    case "B4":
      return 1;
    case "B5":
      return x * x;
  }
}

/** Coefficient de "b" dans F(x)=a·coeffA(x)+b·coeffB(x) (coût TOTAL), par modèle. */
export function coeffB(modele: ModeleCoutUnitaire, x: number): number {
  switch (modele) {
    case "B1":
      return 1;
    case "B2":
      return x * x;
    case "B3":
      return 1 / x;
    case "B4":
      return 1 / x;
    case "B5":
      return 1;
  }
}

export function coutTotalTheorique(modele: ModeleCoutUnitaire, a: number, b: number, x: number): number {
  return a * coeffA(modele, x) + b * coeffB(modele, x);
}

export function coutUnitaireTheorique(modele: ModeleCoutUnitaire, a: number, b: number, x: number): number {
  return coutTotalTheorique(modele, a, b, x) / x;
}

/** Résout {F(x1)=cu1·x1, F(x2)=cu2·x2} pour (a,b) — à partir des points RÉVÉLÉS (exacts), via
 * Cramer sur la base (coeffA,coeffB) du modèle — généralise l'ancienne résolution câblée en dur sur
 * la seule forme cu(x)=a+b/x (B1). */
export function resoudreSystemeScenarioB(modele: ModeleCoutUnitaire, point1: PointRevele, point2: PointRevele): { a: number; b: number } {
  const f1 = point1.coutUnitaire * point1.x;
  const f2 = point2.coutUnitaire * point2.x;
  const a1 = coeffA(modele, point1.x);
  const b1 = coeffB(modele, point1.x);
  const a2 = coeffA(modele, point2.x);
  const b2 = coeffB(modele, point2.x);
  const determinant = a1 * b2 - a2 * b1;
  const a = (f1 * b2 - f2 * b1) / determinant;
  const b = (a1 * f2 - a2 * f1) / determinant;
  return { a, b };
}

/** Plages de tirage de (a,b) par modèle — ajustées à l'échelle de chaque forme pour garder cu(x)
 * lisible sur x∈[1,10] (toujours strictement positif, a et b positifs). */
function tirerAB(modele: ModeleCoutUnitaire): { aVrai: number; bVrai: number } {
  switch (modele) {
    case "B1":
      return { aVrai: entierAleatoire(2, 8), bVrai: entierAleatoire(15, 80) };
    case "B2":
      return { aVrai: entierAleatoire(5, 20), bVrai: entierAleatoire(1, 6) };
    case "B3":
      return { aVrai: entierAleatoire(2, 8), bVrai: entierAleatoire(50, 200) };
    case "B4":
      return { aVrai: entierAleatoire(10, 50), bVrai: entierAleatoire(10, 50) };
    case "B5":
      return { aVrai: entierAleatoire(1, 5), bVrai: entierAleatoire(15, 80) };
  }
}

function contextesDuModele(modele: ModeleCoutUnitaire) {
  switch (modele) {
    case "B1":
      return CONTEXTES_B1;
    case "B2":
      return CONTEXTES_B2;
    case "B3":
      return CONTEXTES_B3;
    case "B4":
      return CONTEXTES_B4;
    case "B5":
      return CONTEXTES_B5;
  }
}

function tirerDeuxPointsEcartes(): [number, number] {
  while (true) {
    const x1 = tirerElement(X_CANDIDATS);
    const x2 = tirerElement(X_CANDIDATS);
    if (Math.abs(x2 - x1) >= ECART_MIN_POINTS) return x1 < x2 ? [x1, x2] : [x2, x1];
  }
}

function tirerDeuxEvaluationsDistinctes(exclus: number[]): [number, number] {
  const disponibles = X_CANDIDATS.filter((x) => !exclus.includes(x));
  const i = Math.floor(Math.random() * disponibles.length);
  let j = Math.floor(Math.random() * disponibles.length);
  while (j === i) j = Math.floor(Math.random() * disponibles.length);
  return [disponibles[i], disponibles[j]];
}

/** Coût unitaire si son écriture décimale EXACTE a au plus 2 décimales, sinon `null` (ex. 26,5 ✓,
 * 12,333… ✗). */
function coutUnitaireExact(modele: ModeleCoutUnitaire, a: number, b: number, x: number): number | null {
  const cu = coutUnitaireTheorique(modele, a, b, x);
  const centiemes = Math.round(cu * 100);
  return Math.abs(cu * 100 - centiemes) < 1e-7 ? centiemes / 100 : null;
}

const TENTATIVES_MAX = 2000;

export function construireScenarioBAvecModele(modele: ModeleCoutUnitaire): ExerciceScenarioB {
  const contexte = tirerElement(contextesDuModele(modele));
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const { aVrai, bVrai } = tirerAB(modele);
    const [x1, x2] = tirerDeuxPointsEcartes();
    const cu1 = coutUnitaireExact(modele, aVrai, bVrai, x1);
    const cu2 = coutUnitaireExact(modele, aVrai, bVrai, x2);
    if (cu1 === null || cu2 === null) continue;

    const point1: PointRevele = { x: x1, coutUnitaire: cu1 };
    const point2: PointRevele = { x: x2, coutUnitaire: cu2 };
    const { a, b } = resoudreSystemeScenarioB(modele, point1, point2);
    // Garde-fou : les points étant exacts, le système redonne (aVrai, bVrai).
    if (Math.abs(a - aVrai) > 1e-6 || Math.abs(b - bVrai) > 1e-6) continue;
    const [xEval1, xEval2] = tirerDeuxEvaluationsDistinctes([x1, x2]);

    return { scenario: "B", modele, contexte, point1, point2, aVrai, bVrai, aArrondiAttendu: aVrai, bArrondiAttendu: bVrai, xEval1, xEval2 };
  }
  throw new Error(`construireScenarioBAvecModele(${modele}) : aucun tirage exact trouvé après ${TENTATIVES_MAX} tentatives.`);
}

export function genererExerciceScenarioB(): ExerciceScenarioB {
  return construireScenarioBAvecModele(tirerElement(MODELES));
}
