import type { Q } from "../ui6e/outilsVariablesAleatoiresLotH1";
import { q } from "../ui6e/outilsVariablesAleatoiresLotH1";

/**
 * Couche A — modèle de `6gen115` « Loi uniforme continue » (6e ch. 8, § 5 ; reprend l'ancienne
 * famille E de 6gen52, avec a ≠ 0). X uniforme sur [a ; b] (entiers, en contexte : arrivée à un arrêt,
 * livreur, panne sur un câble, cuisson, trajet).
 * - `direct` : densité 1/(b − a), une probabilité (intervalle intérieur, intervalle qui DÉBORDE de
 *   [a ; b] — on garde l'intersection —, ou « au moins c » / « au plus c »), E(X), V(X) et σ(X).
 * - `inverse` : E(X) et V(X) donnés, retrouver b − a (par (b − a)² = 12 V), puis a et b, puis
 *   P(X ≤ c).
 */

export type Variante115 = "direct" | "inverse";
export type Contexte115 = "arrivee" | "livreur" | "panne" | "cuisson" | "trajet";
export type Phase115 = "densite" | "proba" | "esperance" | "dispersion" | "longueur" | "bornes" | "probaInv";
export type Evenement115 = "entre" | "deborde" | "auMoins" | "auPlus";

export interface Exercice115 {
  variante: Variante115;
  contexte: Contexte115;
  a: number;
  b: number;
  /** Événement de la variante `direct` (bornes c ≤ d, éventuellement hors de [a ; b]). */
  evenement?: { type: Evenement115; c: number; d: number };
  /** Variante `inverse` : P(X ≤ c). */
  cInv?: number;
}

export function phases115(e: Exercice115): Phase115[] {
  return e.variante === "direct" ? ["densite", "proba", "esperance", "dispersion"] : ["longueur", "bornes", "probaInv"];
}

export const longueur = (e: Exercice115) => e.b - e.a;
export const densite115 = (e: Exercice115): Q => q(1, longueur(e));
export const esperance115 = (e: Exercice115) => (e.a + e.b) / 2;
export const variance115 = (e: Exercice115): Q => q(longueur(e) ** 2, 12);
export const ecartType115 = (e: Exercice115) => longueur(e) / Math.sqrt(12);

/** Intersection [c' ; d'] de l'événement avec [a ; b]. */
export function intersection(e: Exercice115): [number, number] {
  const { c, d } = e.evenement!;
  return [Math.max(c, e.a), Math.min(d, e.b)];
}

export function proba115(e: Exercice115): Q {
  const [c, d] = intersection(e);
  return q(d - c, longueur(e));
}

export const probaInv115 = (e: Exercice115): Q => q(e.cInv! - e.a, longueur(e));

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function bornes(contexte: Contexte115, longueurs: number[]): [number, number] {
  for (;;) {
    const L = parmi(longueurs);
    let a: number;
    switch (contexte) {
      case "arrivee":
        a = entier(5, 25);
        if (a + L > 59) continue;
        break;
      case "livreur":
        a = entier(10, 35);
        if (a + L > 100) continue;
        break;
      case "panne":
        a = entier(5, 30);
        break;
      case "cuisson":
        a = entier(20, 35);
        break;
      case "trajet":
        a = entier(40, 55);
        break;
    }
    return [a, a + L];
  }
}

const LONGUEURS_DIRECT: Record<Contexte115, number[]> = {
  arrivee: [20, 24, 30, 36, 40],
  livreur: [30, 40, 45, 50, 60],
  panne: [8, 10, 12, 15, 16, 20, 24, 30],
  cuisson: [6, 8, 10, 12],
  trajet: [10, 12, 15, 16, 20],
};

/** Longueurs dont la variance L²/12 est un décimal exact. */
const LONGUEURS_INVERSE: Record<Contexte115, number[]> = {
  arrivee: [12, 18, 24, 30, 36],
  livreur: [30, 36, 45, 48, 60],
  panne: [6, 9, 12, 15, 18, 24],
  cuisson: [6, 9, 12],
  trajet: [12, 15, 18],
};

export function tirer115(variante: Variante115): Exercice115 {
  const contexte = parmi<Contexte115>(["arrivee", "livreur", "panne", "cuisson", "trajet"]);
  if (variante === "direct") {
    const [a, b] = bornes(contexte, LONGUEURS_DIRECT[contexte]);
    const type = parmi<Evenement115>(["entre", "deborde", "auMoins", "auPlus"]);
    const L = b - a;
    let c: number;
    let d: number;
    if (type === "entre") {
      do {
        c = entier(a + 1, b - 2);
        d = entier(c + 1, b - 1);
      } while (d - c === L);
    } else if (type === "deborde") {
      if (Math.random() < 0.5) {
        // Borne gauche avant a, jamais négative (instant ou position réels).
        c = a - entier(1, Math.max(1, Math.min(a, Math.floor(L / 3))));
        d = entier(a + 1, b - 1);
      } else {
        c = entier(a + 1, b - 1);
        d = b + entier(1, Math.max(2, Math.floor(L / 3)));
      }
    } else if (type === "auMoins") {
      c = entier(a + 1, b - 1);
      d = b;
    } else {
      c = a;
      d = entier(a + 1, b - 1);
    }
    return { variante, contexte, a, b, evenement: { type, c, d } };
  }
  const [a, b] = bornes(contexte, LONGUEURS_INVERSE[contexte]);
  let cInv = entier(a + 1, b - 1);
  while (2 * cInv === a + b) cInv = entier(a + 1, b - 1);
  return { variante, contexte, a, b, cInv };
}
