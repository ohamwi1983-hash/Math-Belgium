import type { Q } from "../ui6e/nombresExp";
import { q, qMul, qSub, qAdd, qVal } from "../ui6e/nombresExp";

/**
 * Couche core — `6gen161` « Quel jeu choisir ? » (6e ch. 6, § 4, processus 3 TRANSFÉRER). Deux jeux
 * de hasard (dés, pièces, urnes avec ou sans remise, roues) ; l'élève calcule la probabilité de
 * gagner à chacun (dénombrement, arbre, événement contraire), puis choisit : jeu A, jeu B, ou
 * autant de chances. Probabilités EXACTES (rationnels). Aucune espérance (pas au programme ici).
 */

export type Jeu =
  | { type: "somme"; s: number; mode: "egal" | "auMoins" }
  | { type: "auMoinsUnDe"; k: number }
  | { type: "double" }
  | { type: "ecart"; d: number; mode: "egal" | "auMoins" }
  | { type: "produitPair" }
  | { type: "repete"; n: number }
  | { type: "pieces"; n: number; k: number; mode: "exactement" | "auMoins" }
  | { type: "urne"; r: number; v: number; remise: boolean; evt: "deuxR" | "meme" | "auMoinsUneR" | "differentes" }
  | { type: "roue"; n: number; k: number; evt: "deuxFois" | "auMoinsUne" | "exactementUne" };

export type Famille = "de" | "pieces" | "urne" | "roue";
export type Variante161 = "des" | "urnes" | "melange";
export type Verdict161 = "A" | "B" | "egal";
export const VERDICTS_161: Verdict161[] = ["A", "B", "egal"];

export interface Exercice161 {
  variante: Variante161;
  verdict: Verdict161;
  ctx: number;
  jeuA: Jeu;
  jeuB: Jeu;
}

export const CONTEXTES_161 = [
  "À la kermesse de l'école, deux stands proposent un jeu au même prix. Tu ne peux jouer qu'à un seul des deux.",
  "Pour gagner un ticket de cinéma, on te laisse choisir entre deux jeux. Tu ne joues qu'une fois, à un seul jeu.",
  "Une fête foraine propose deux jeux au même prix. Tu as de quoi jouer une seule fois.",
];

export function famille(j: Jeu): Famille {
  if (j.type === "pieces") return "pieces";
  if (j.type === "urne") return "urne";
  if (j.type === "roue") return "roue";
  return "de";
}

const C = (n: number, k: number): number => {
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
};
export const binom = C;

/** Nombre de couples (d₁ ; d₂) de deux dés à six faces dont la somme vaut s. */
export const couplesSomme = (s: number) => (s < 2 || s > 12 ? 0 : 6 - Math.abs(s - 7));

/** Nombre de couples de deux dés dont l'écart (plus grand − plus petit) vaut d. */
export const couplesEcart = (d: number) => (d === 0 ? 6 : d < 0 || d > 5 ? 0 : 2 * (6 - d));

/** Second tirage dans l'urne : effectifs après une première boule de couleur donnée. */
export function apres(j: Extract<Jeu, { type: "urne" }>, premiere: "r" | "v"): { r: number; v: number; n: number } {
  if (j.remise) return { r: j.r, v: j.v, n: j.r + j.v };
  return premiere === "r" ? { r: j.r - 1, v: j.v, n: j.r + j.v - 1 } : { r: j.r, v: j.v - 1, n: j.r + j.v - 1 };
}

export function proba(j: Jeu): Q {
  switch (j.type) {
    case "somme": {
      if (j.mode === "egal") return q(couplesSomme(j.s), 36);
      let c = 0;
      for (let s = j.s; s <= 12; s++) c += couplesSomme(s);
      return q(c, 36);
    }
    case "auMoinsUnDe":
      return qSub(q(1), q((j.k - 1) ** 2, 36));
    case "double":
      return q(1, 6);
    case "ecart": {
      let c = 0;
      for (let d = j.d; d <= (j.mode === "egal" ? j.d : 5); d++) c += couplesEcart(d);
      return q(c, 36);
    }
    case "produitPair":
      return qSub(q(1), q(9, 36));
    case "repete":
      return qSub(q(1), q(5 ** j.n, 6 ** j.n));
    case "pieces": {
      let c = 0;
      for (let k = j.k; k <= (j.mode === "exactement" ? j.k : j.n); k++) c += C(j.n, k);
      return q(c, 2 ** j.n);
    }
    case "urne": {
      const n = j.r + j.v;
      const ar = apres(j, "r");
      const av = apres(j, "v");
      const RR = qMul(q(j.r, n), q(ar.r, ar.n));
      const VV = qMul(q(j.v, n), q(av.v, av.n));
      const RV = qMul(q(j.r, n), q(ar.v, ar.n));
      const VR = qMul(q(j.v, n), q(av.r, av.n));
      if (j.evt === "deuxR") return RR;
      if (j.evt === "meme") return qAdd(RR, VV);
      if (j.evt === "auMoinsUneR") return qSub(q(1), VV);
      return qAdd(RV, VR);
    }
    case "roue": {
      const g = q(j.k, j.n);
      const p = q(j.n - j.k, j.n);
      if (j.evt === "deuxFois") return qMul(g, g);
      if (j.evt === "auMoinsUne") return qSub(q(1), qMul(p, p));
      return qAdd(qMul(g, p), qMul(p, g));
    }
  }
}

/** Catalogue complet des jeux (déterministe), probabilités entre 0,05 et 0,9. */
export function catalogueJeux(): Jeu[] {
  const out: Jeu[] = [];
  for (let s = 3; s <= 11; s++) out.push({ type: "somme", s, mode: "egal" });
  for (const s of [9, 10, 11]) out.push({ type: "somme", s, mode: "auMoins" });
  for (const k of [5, 6]) out.push({ type: "auMoinsUnDe", k });
  out.push({ type: "double" });
  for (const d of [1, 2, 3, 4]) out.push({ type: "ecart", d, mode: "egal" });
  for (const d of [2, 3, 4]) out.push({ type: "ecart", d, mode: "auMoins" });
  out.push({ type: "produitPair" });
  for (const n of [2, 3, 4]) out.push({ type: "repete", n });
  for (const n of [2, 3, 4]) {
    for (let k = 1; k < n; k++) out.push({ type: "pieces", n, k, mode: "exactement" });
    for (let k = 1; k < n; k++) out.push({ type: "pieces", n, k, mode: "auMoins" });
  }
  for (let r = 1; r <= 6; r++)
    for (let v = 1; v <= 6; v++) {
      if (r + v < 3 || r + v > 8) continue;
      for (const remise of [true, false])
        for (const evt of ["deuxR", "meme", "auMoinsUneR", "differentes"] as const) {
          if (!remise && evt === "deuxR" && r < 2) continue;
          if (!remise && evt === "meme" && r < 2 && v < 2) continue;
          out.push({ type: "urne", r, v, remise, evt });
        }
    }
  for (const n of [4, 5, 6, 8, 10])
    for (let k = 1; k < n; k++) for (const evt of ["deuxFois", "auMoinsUne", "exactementUne"] as const) out.push({ type: "roue", n, k, evt });
  return out.filter((j) => {
    const p = qVal(proba(j));
    return p >= 0.05 && p <= 0.9;
  });
}

export function signature(j: Jeu): string {
  return JSON.stringify(j);
}
