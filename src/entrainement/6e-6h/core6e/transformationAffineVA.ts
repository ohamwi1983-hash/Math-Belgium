/**
 * Couche A — modèle de `6gen111` « Y = aX + b » (6e ch. 8, § 1 ; standardisation au § 6). Une
 * variable X de moyenne et d'écart-type (ou de variance) connus est transformée par une situation
 * (conversion de devise ou de température, mise retranchée, points convertis en euros, prime qui
 * diminue avec les défauts, carburant restant) : E(Y) = aE(X) + b, V(Y) = a²V(X), σ(Y) = |a|σ(X),
 * sans reconstruire la loi. Tous les nombres sont des décimaux courts EXACTS.
 */

export type Contexte111 = "devise" | "mise" | "points" | "temperature" | "prime" | "reservoir";
export type Famille111 = "conversion" | "jeu" | "decroissant";
export type Phase111 = "coefficients" | "esperance" | "variance" | "ecartType";

export const PHASES_111: Phase111[] = ["coefficients", "esperance", "variance", "ecartType"];

export const FAMILLES_111: Record<Famille111, Contexte111[]> = {
  conversion: ["devise", "temperature"],
  jeu: ["mise", "points"],
  decroissant: ["prime", "reservoir"],
};

export interface Exercice111 {
  famille: Famille111;
  contexte: Contexte111;
  a: number;
  b: number;
  /** E(X). */
  eX: number;
  /** σ(X). */
  sX: number;
  /** Donnée de l'énoncé : la variance V(X) = σ(X)² ou l'écart-type σ(X). */
  donnee: "variance" | "ecartType";
}

const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
export const vX = (e: Exercice111) => r6(e.sX * e.sX);
export const eY = (e: Exercice111) => r6(e.a * e.eX + e.b);
export const vY = (e: Exercice111) => r6(e.a * e.a * vX(e));
export const sY = (e: Exercice111) => r6(Math.abs(e.a) * e.sX);

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

export function tirer111(famille: Famille111): Exercice111 {
  const contexte = parmi(FAMILLES_111[famille]);
  const donnee = parmi<"variance" | "ecartType">(["variance", "ecartType"]);
  const base = { famille, contexte, donnee };
  switch (contexte) {
    case "devise":
      return { ...base, a: parmi([1.1, 1.2, 1.25]), b: 0, eX: 10 * entier(12, 40), sX: parmi([15, 20, 24, 30, 40]) };
    case "temperature":
      return { ...base, a: 1.8, b: 32, eX: entier(12, 25), sX: parmi([2, 2.5, 3, 4, 5]) };
    case "mise":
      return { ...base, a: 1, b: -entier(2, 6), eX: entier(25, 80) / 10, sX: parmi([1.5, 2, 2.5, 3, 4]) };
    case "points":
      return { ...base, a: parmi([0.5, 2, 3]), b: -parmi([5, 10]), eX: entier(50, 150) / 10, sX: parmi([2, 2.5, 3, 4]) };
    case "prime":
      return { ...base, a: -parmi([10, 15, 20]), b: parmi([150, 200, 250]), eX: parmi([1.5, 2, 2.4, 3.2]), sX: parmi([0.8, 1.2, 1.5, 2]) };
    case "reservoir":
      return { ...base, a: -1, b: parmi([45, 50, 60]), eX: entier(60, 120) / 10, sX: parmi([1.5, 2, 2.5]) };
  }
}
