import { arrondiZ, phiExact, phiTable } from "./tablePhi";

/**
 * Couche core — `6gen118` « Approximation normale avec correction de continuité » (6e ch. 8, § 7,
 * processus 2 APPLIQUER). X ∼ 𝓑(n ; p). Conditions du cours (convention) : n > 30 et 0,3 < p < 0,7.
 * Le VERDICT « approximable ? » est tiré à parts égales AVANT les nombres (jamais dans `forme`) :
 * - oui : μ = np, σ = √(np(1 − p)) ; borne(s) corrigée(s) k ± 0,5 ; z au centième ; Φ (table) ;
 * - non : la condition qui n'est pas remplie (n ≤ 30, ou p hors de ]0,3 ; 0,7[ — n = 30, p = 0,3 et
 *   p = 0,7 pièges compris), puis la probabilité EXACTE de la loi binomiale (calculatrice).
 * La variante est l'ÉVÉNEMENT : P(X ≤ k), P(X < k), P(X ≥ k), P(X = k), P(k₁ ≤ X ≤ k₂).
 */

export type EvenementAN = "auPlus" | "moinsDe" | "auMoins" | "exactement" | "entre";
export type PhaseAN = "verdict" | "parametres" | "bornes" | "z" | "proba" | "condition" | "exacte";

export const EVENEMENTS_AN: EvenementAN[] = ["auPlus", "moinsDe", "auMoins", "exactement", "entre"];

export interface ExerciceAN {
  variante: EvenementAN;
  approximable: boolean;
  /** Condition en défaut (non approximable). */
  echec: "n" | "p" | null;
  ctx: number;
  n: number;
  /** p en centièmes (40 → 0,4). */
  pc: number;
  /** k (ou k₁) et k₂ (« entre »). */
  k: number;
  k2: number;
}

export const SEUIL_N = 30;
export const P_MIN = 30;
export const P_MAX = 70;

export const pDe = (e: ExerciceAN) => e.pc / 100;
export const mu = (e: ExerciceAN) => (e.n * e.pc) / 100;
export const sigma2 = (e: ExerciceAN) => (e.n * e.pc * (100 - e.pc)) / 10000;
export const sigma = (e: ExerciceAN) => Math.sqrt(sigma2(e));
export const conditionNOk = (n: number) => n > SEUIL_N;
export const conditionPOk = (pc: number) => pc > P_MIN && pc < P_MAX;

export function phases(e: ExerciceAN): PhaseAN[] {
  return e.approximable ? ["verdict", "parametres", "bornes", "z", "proba"] : ["verdict", "condition", "exacte"];
}

export const deuxBornes = (e: ExerciceAN) => e.variante === "exactement" || e.variante === "entre";

/** Borne(s) corrigée(s) : [une] ou [inf, sup]. */
export function bornesCorrigees(e: ExerciceAN): number[] {
  switch (e.variante) {
    case "auPlus":
      return [e.k + 0.5];
    case "moinsDe":
      return [e.k - 0.5];
    case "auMoins":
      return [e.k - 0.5];
    case "exactement":
      return [e.k - 0.5, e.k + 0.5];
    case "entre":
      return [e.k - 0.5, e.k2 + 0.5];
  }
}

/** Bornes SANS correction (messages, vérification « sans correction »). */
export function bornesBrutes(e: ExerciceAN): number[] {
  switch (e.variante) {
    case "auPlus":
    case "moinsDe":
    case "auMoins":
      return [e.k];
    case "exactement":
      return [e.k, e.k];
    case "entre":
      return [e.k, e.k2];
  }
}

export const zExact = (e: ExerciceAN, b: number) => (b - mu(e)) / sigma(e);
export const zArrondis = (e: ExerciceAN) => bornesCorrigees(e).map((b) => arrondiZ(zExact(e, b)));

/** Probabilité normale à partir des z (forme de l'événement), avec une fonction Φ donnée. */
export function probaDepuisZ(e: ExerciceAN, zs: number[], phi: (z: number) => number): number {
  if (e.variante === "auMoins") return 1 - phi(zs[0]!);
  if (zs.length === 2) return phi(zs[1]!) - phi(zs[0]!);
  return phi(zs[0]!);
}

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
/** Valeur de référence (table, z au centième). */
export const probaTable = (e: ExerciceAN) => r4(probaDepuisZ(e, zArrondis(e), phiTable));
/** Valeurs acceptées : table avec chacun des z au centième voisins du z exact (σ arrondi), et Φ exact. */
export function probasAcceptees(e: ExerciceAN): number[] {
  const voisins = bornesCorrigees(e).map((b) => {
    const z = zExact(e, b);
    const c = [Math.floor(z * 100) / 100, Math.ceil(z * 100) / 100, arrondiZ(z)];
    return [...new Set(c.filter((x) => Math.abs(x - z) <= 0.0101).map((x) => Math.round(x * 100) / 100))];
  });
  const res: number[] = [probaDepuisZ(e, bornesCorrigees(e).map((b) => zExact(e, b)), phiExact)];
  const combos = voisins.length === 1 ? voisins[0]!.map((z) => [z]) : voisins[0]!.flatMap((a) => voisins[1]!.map((b) => [a, b]));
  for (const zs of combos) res.push(r4(probaDepuisZ(e, zs, phiTable)));
  return res;
}

/** Loi binomiale exacte P(X = i), i = 0 … n. */
export function loiBinomiale(n: number, p: number): number[] {
  const q = 1 - p;
  const res: number[] = [q ** n];
  for (let i = 0; i < n; i++) res.push((res[i]! * (n - i) * p) / ((i + 1) * q));
  return res;
}

/** Probabilité EXACTE de l'événement (loi binomiale). */
export function probaExacte(e: ExerciceAN): number {
  const L = loiBinomiale(e.n, pDe(e));
  const somme = (a: number, b: number) => L.slice(Math.max(0, a), Math.min(e.n, b) + 1).reduce((s, x) => s + x, 0);
  switch (e.variante) {
    case "auPlus":
      return somme(0, e.k);
    case "moinsDe":
      return somme(0, e.k - 1);
    case "auMoins":
      return 1 - somme(0, e.k - 1);
    case "exactement":
      return L[e.k]!;
    case "entre":
      return somme(e.k, e.k2);
  }
}

/** Approximation SANS correction de continuité (corrigé : les trois valeurs, audit C4). */
export function probaSansCorrection(e: ExerciceAN): number {
  const b = bornesBrutes(e);
  if (e.variante === "exactement") return 0;
  return probaDepuisZ(e, b.map((x) => zExact(e, x)), phiExact);
}
