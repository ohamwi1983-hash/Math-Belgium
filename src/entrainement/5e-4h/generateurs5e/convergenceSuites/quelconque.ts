import type { ClassificationQuelconque, ExerciceConvergenceQuelconque, PolynomeConvergence } from "../../core5e/convergenceSuites.types";

function entierAleatoire(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function entierNonNul(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = entierAleatoire(min, max);
  return v;
}
function elementAleatoire<T>(tab: readonly T[]): T {
  return tab[Math.floor(Math.random() * tab.length)];
}

/** `a=0` pour un degré 1 (jamais un champ `degre` désynchronisable, voir le contrat) — le
 * coefficient dominant (`b` en degré 1, `a` en degré 2) est TOUJOURS non nul par construction. */
function polynome(deg: 1 | 2): PolynomeConvergence {
  const b = entierNonNul(-9, 9);
  const c = entierAleatoire(-9, 9);
  const a = deg === 2 ? entierNonNul(-9, 9) : 0;
  return { a, b, c };
}

function coefficientDominant(p: PolynomeConvergence, deg: 1 | 2): number {
  return deg === 2 ? p.a : p.b;
}

function evaluer(p: PolynomeConvergence, n: number): number {
  return p.a * n * n + p.b * n + p.c;
}

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** Racines réelles d'un polynôme de degré 1 ou 2 (aucune si Δ < 0). */
function racinesReelles(p: PolynomeConvergence): number[] {
  if (p.a === 0) return [-p.c / p.b];
  const delta = p.b * p.b - 4 * p.a * p.c;
  if (delta < 0) return [];
  return [(-p.b - Math.sqrt(delta)) / (2 * p.a), (-p.b + Math.sqrt(delta)) / (2 * p.a)];
}

/**
 * Audit 5c3b, points 5 et 6 — tirages rejetés :
 * - Q(n) = 0 pour un entier n de 1 à 30 : la suite ne serait pas définie pour tout n ≥ 1 (avec des
 *   coefficients dans [−9 ; 9], une racine entière vaut au plus 9 en valeur absolue : 30 suffit) ;
 * - P et Q ont une racine commune (fraction simplifiable par un facteur en n) : une racine commune
 *   réelle annule P en une racine de Q ; deux trinômes sans racine réelle n'ont une racine
 *   complexe commune que s'ils sont proportionnels (degré 2 tous les deux, rapport constant) ;
 * - tous les coefficients ont un diviseur commun > 1 (fraction simplifiable par une constante).
 */
function tirageValide(P: PolynomeConvergence, Q: PolynomeConvergence): boolean {
  for (let n = 1; n <= 30; n++) if (evaluer(Q, n) === 0) return false;
  for (const r of racinesReelles(Q)) if (Math.abs(evaluer(P, r)) < 1e-9 * Math.max(1, r * r)) return false;
  if (P.a !== 0 && Q.a !== 0 && P.a * Q.b === P.b * Q.a && P.a * Q.c === P.c * Q.a) return false;
  const diviseur = [P.a, P.b, P.c, Q.a, Q.b, Q.c].reduce((g, v) => pgcd(g, v), 0);
  return diviseur <= 1;
}

const CAS = ["inferieur", "egal", "superieur"] as const;

/** "Cible d'abord" : le cas de comparaison de degré est choisi EN PREMIER (uniforme, "fréquence
 * comparable" explicite de la spec), les degrés P/Q en découlent — jamais un tirage indépendant des
 * 2 degrés qui laisserait le cas "égal" à une seule chance sur 4 (contre 1/2 pour chacun des 2 cas
 * d'inégalité, qui n'ont qu'une seule paire de degrés possible dans {1,2}²). */
export function genererExerciceConvergenceQuelconque(): ExerciceConvergenceQuelconque {
  const cas = elementAleatoire(CAS);
  let degP: 1 | 2;
  let degQ: 1 | 2;
  if (cas === "inferieur") {
    degP = 1;
    degQ = 2;
  } else if (cas === "superieur") {
    degP = 2;
    degQ = 1;
  } else {
    const d = elementAleatoire([1, 2] as const);
    degP = d;
    degQ = d;
  }
  let P = polynome(degP);
  let Q = polynome(degQ);
  while (!tirageValide(P, Q)) {
    P = polynome(degP);
    Q = polynome(degQ);
  }

  let classification: ClassificationQuelconque;
  let limiteValeur: number | null = null;
  if (degP < degQ) {
    classification = "limiteZero";
  } else if (degP === degQ) {
    classification = "limiteValeur";
    limiteValeur = coefficientDominant(P, degP) / coefficientDominant(Q, degQ);
  } else {
    const signe = Math.sign(coefficientDominant(P, degP)) * Math.sign(coefficientDominant(Q, degQ));
    classification = signe > 0 ? "divergePlusInfini" : "divergeMoinsInfini";
  }

  return { variante: "quelconque", P, degP, Q, degQ, classification, limiteValeur };
}
