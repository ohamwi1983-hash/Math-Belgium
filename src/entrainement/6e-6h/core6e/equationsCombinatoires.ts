/**
 * Couche A — modèle de `6gen101` « Factorielles et équations combinatoires » (6e ch. 7, § 1). Le
 * membre de gauche se réécrit en polynôme α(n² + βn + γ) ; l'équation donne n² + βn + c = 0, deux
 * racines entières dont UNE seule est admissible (l'autre est négative : factorielle ou
 * coefficient non défini). Variante « symétrie » : Cₙᵖ = Cₙ^q (p ≠ q) ⇔ n = p + q, ou
 * C_N^k = C_N^{k+d} ⇔ 2k + d = N.
 */

export type Variante101 = "quotient" | "arrangement" | "combinaison" | "mixte" | "symetrie";
export type Phase101 = "polynome" | "racines" | "admissible" | "propriete" | "valeur";

export interface Exercice101 {
  variante: Variante101;
  /** Solution admissible (n, ou k pour la symétrie en k). */
  sol: number;
  /** Second membre (variantes polynomiales). */
  V: number;
  /** Décalage du quotient (n+s)!/(n+s−2)! (variante « quotient »). */
  s: number;
  /** Symétrie : inconnue « n » (Cₙᵖ = Cₙ^q) ou « k » (C_N^k = C_N^{k+d}). */
  inconnue: "n" | "k";
  /** Symétrie en n : p < q ; symétrie en k : N et d. */
  p: number;
  q: number;
}

export function phases101(e: Exercice101): Phase101[] {
  return e.variante === "symetrie" ? ["propriete", "valeur"] : ["polynome", "racines", "admissible"];
}

/** Coefficients du membre de gauche : α(n² + βn + γ). */
export function coefficients(e: Exercice101): { alpha: number; beta: number; gamma: number } {
  switch (e.variante) {
    case "quotient":
      return { alpha: 1, beta: 2 * e.s - 1, gamma: e.s * e.s - e.s };
    case "arrangement":
      return { alpha: 1, beta: -1, gamma: 0 };
    case "combinaison":
      return { alpha: 0.5, beta: -1, gamma: 0 };
    case "mixte":
      return { alpha: 0.5, beta: 1, gamma: 0 };
    case "symetrie":
      return { alpha: 0, beta: 0, gamma: 0 };
  }
}

/** Polynôme du membre de gauche (fonction). */
export function polynome(e: Exercice101): (n: number) => number {
  const { alpha, beta, gamma } = coefficients(e);
  return (n) => alpha * (n * n + beta * n + gamma);
}

/** Équation n² + βn + c = 0 (c = γ − V/α). */
export function equationReduite(e: Exercice101): { b: number; c: number } {
  const { alpha, beta, gamma } = coefficients(e);
  return { b: beta, c: gamma - e.V / alpha };
}

/** Les deux racines (ordre croissant) ; la plus grande est la solution admissible. */
export function racines101(e: Exercice101): [number, number] {
  const { b, c } = equationReduite(e);
  const d = Math.sqrt(b * b - 4 * c);
  return [(-b - d) / 2, (-b + d) / 2];
}

/** Plus petit n pour lequel le membre de gauche est défini. */
export function nMin(e: Exercice101): number {
  switch (e.variante) {
    case "quotient":
      return 2 - e.s;
    case "arrangement":
    case "combinaison":
      return 2;
    case "mixte":
      return 2;
    case "symetrie":
      return e.inconnue === "n" ? e.q : 0;
  }
}

/** Valeur attendue de l'écran « valeur » (symétrie). */
export const solutionSymetrie = (e: Exercice101) => (e.inconnue === "n" ? e.p + e.q : (e.p - e.q) / 2);
