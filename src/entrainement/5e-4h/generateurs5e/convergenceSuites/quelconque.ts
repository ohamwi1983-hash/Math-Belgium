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
  const P = polynome(degP);
  const Q = polynome(degQ);

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
