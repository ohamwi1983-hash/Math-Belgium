import type { Fr } from "../ui6e/nombresCombinatoireLotH2";
import { C, fact, fr, frMul, frPow, frSub, frVal } from "../ui6e/nombresCombinatoireLotH2";
import { phiExact, phiTable } from "./tablePhi";

/**
 * Couche core — `6gen119` « Choisir le modèle » (6e ch. 8, fin du chapitre, processus 3 TRANSFÉRER).
 * Une situation en contexte ; le MODÈLE (binomiale, hypergéométrique, Poisson, normale, uniforme
 * continue ou aucune de ces lois) est le VERDICT de l'écran 1, tiré au sixième AVANT les nombres. Écran
 * 2 : les paramètres de la loi (ou, pour « aucune », la raison) ; écran 3 : une probabilité. La variante
 * EST le modèle : groupe à verdict `groupe_modele` dans le panneau d'évaluation.
 */

export type ModeleCM = "binomiale" | "hypergeometrique" | "poisson" | "normale" | "uniforme" | "aucune";
export type PhaseCM = "modele" | "parametres" | "raison" | "proba";
export type RaisonCM = "nonFixe" | "pasSucces" | "peuEpreuves" | "equiprobable";

export const MODELES_CM: ModeleCM[] = ["binomiale", "hypergeometrique", "poisson", "normale", "uniforme", "aucune"];
export const RAISONS_CM: RaisonCM[] = ["nonFixe", "pasSucces", "peuEpreuves", "equiprobable"];

export interface ExerciceCM {
  variante: ModeleCM;
  ctx: number;
  /** Paramètres entiers du scénario (voir `generateurs6e/choisirModele/index.ts`). */
  d: Record<string, number>;
  /** Ordre des raisons (« aucune »). */
  raisons: RaisonCM[];
}

export const phases = (e: ExerciceCM): PhaseCM[] => (e.variante === "aucune" ? ["modele", "raison", "proba"] : ["modele", "parametres", "proba"]);

/** Raison juste (« aucune ») : contextes 0 et 2 → nombre d'épreuves non fixé ; 1 → somme de deux dés. */
export const raisonJuste = (e: ExerciceCM): RaisonCM => (e.ctx === 1 ? "pasSucces" : "nonFixe");

/** Probabilité de succès (binomiale) en fraction. */
export function pBinomiale(e: ExerciceCM): Fr {
  if (e.ctx === 0) return fr(1, 4);
  if (e.ctx === 1) return fr(1, 6);
  return fr(e.d.pc!, 100);
}

/** λ (Poisson). */
export function lambda(e: ExerciceCM): number {
  if (e.ctx === 0) return (e.d.r! * e.d.t!) / 60;
  if (e.ctx === 1) return (e.d.r! * e.d.m!) / 10;
  return (e.d.r! * e.d.mois!) / 12;
}

/** Bornes de la loi uniforme. */
export function bornesUniforme(e: ExerciceCM): [number, number] {
  if (e.ctx === 0) return [0, e.d.T!];
  if (e.ctx === 1) return [e.d.a!, e.d.b!];
  return [0, 360];
}

/** Valeurs des paramètres de l'écran 2, dans l'ordre des champs. */
export function parametres(e: ExerciceCM): number[] {
  switch (e.variante) {
    case "binomiale":
      return [e.d.n!, frVal(pBinomiale(e))];
    case "hypergeometrique":
      return [e.d.N!, e.d.K!, e.d.n!];
    case "poisson":
      return [lambda(e)];
    case "normale":
      return [e.d.mu!, e.d.sigma!];
    case "uniforme":
      return bornesUniforme(e);
    case "aucune":
      return [];
  }
}

const poissonTerme = (l: number, k: number) => (Math.exp(-l) * l ** k) / fact(k);

/** z de la loi normale (x0 = μ + zσ, z à deux décimales EXACT : `d.zc` centièmes). */
export const zNormale = (e: ExerciceCM) => e.d.zc! / 100;

/** Probabilité demandée : valeur exacte (fraction) quand elle existe, et valeur numérique. */
export function probabilite(e: ExerciceCM): { exacte: Fr | null; valeur: number; table?: number } {
  const d = e.d;
  switch (e.variante) {
    case "binomiale": {
      const p = pBinomiale(e);
      const terme = (k: number) => frMul(fr(C(d.n!, k)), frMul(frPow(p, k), frPow(frSub(fr(1), p), d.n! - k)));
      const x = d.q === 1 ? frSub(fr(1), terme(0)) : terme(d.k!);
      return { exacte: x, valeur: frVal(x) };
    }
    case "hypergeometrique": {
      const x = fr(C(d.K!, d.k!) * C(d.N! - d.K!, d.n! - d.k!), C(d.N!, d.n!));
      return { exacte: x, valeur: frVal(x) };
    }
    case "poisson": {
      const l = lambda(e);
      const v = d.q === 1 ? poissonTerme(l, 0) + poissonTerme(l, 1) : poissonTerme(l, d.k!);
      return { exacte: null, valeur: v };
    }
    case "normale": {
      const z = zNormale(e);
      const auDessus = d.q === 1;
      return { exacte: null, valeur: auDessus ? 1 - phiExact(z) : phiExact(z), table: Math.round((auDessus ? 1 - phiTable(z) : phiTable(z)) * 1e4) / 1e4 };
    }
    case "uniforme": {
      const [a, b] = bornesUniforme(e);
      const longueur = d.q === 0 ? d.d! - d.c! : d.q === 1 ? b - d.c! : d.c! - a;
      const x = fr(longueur, b - a);
      return { exacte: x, valeur: frVal(x) };
    }
    case "aucune": {
      if (e.ctx === 0) {
        const x = frMul(frPow(fr(5, 6), d.k! - 1), fr(1, 6));
        return { exacte: x, valeur: frVal(x) };
      }
      if (e.ctx === 1) {
        const x = fr(6 - Math.abs(d.s! - 7), 36);
        return { exacte: x, valeur: frVal(x) };
      }
      // Urne sans remise jusqu'à la première rouge : P(X = k), k = 2 ou 3.
      const R = d.R!;
      const B = d.B!;
      let x = fr(1);
      for (let i = 0; i < d.k! - 1; i++) x = frMul(x, fr(B - i, R + B - i));
      x = frMul(x, fr(R, R + B - (d.k! - 1)));
      return { exacte: x, valeur: frVal(x) };
    }
  }
}

/** Valeurs de référence acceptées pour la probabilité (exacte, et table pour la loi normale). */
export function refsProba(e: ExerciceCM): number[] {
  const p = probabilite(e);
  return p.table !== undefined ? [p.valeur, p.table] : [p.valeur];
}

/** Valeurs qu'aurait données un AUTRE modèle (messages ciblés) — binomiale ↔ hypergéométrique. */
export function probaAutreModele(e: ExerciceCM): number | null {
  const d = e.d;
  if (e.variante === "hypergeometrique") {
    const p = d.K! / d.N!;
    return C(d.n!, d.k!) * p ** d.k! * (1 - p) ** (d.n! - d.k!);
  }
  return null;
}

