import type { ExContexte160, ExTableau160, ExValeurs160, ExVenn160, Exercice160, Univers160, Variante160, Verdict160 } from "../../core6e/independantsIncompatibles";
import { CONTEXTES_160, VERDICTS_160, verdictCalcule } from "../../core6e/independantsIncompatibles";
import { evenementsUnivers, issues } from "../../core6e/evenements160";
import type { Q } from "../../ui6e/nombresExp";
import { q, qAdd, qMul, qSub, qVal } from "../../ui6e/nombresExp";

/**
 * Couche A — générateur de `6gen160` « Indépendants ou incompatibles ? ». `Math.random()` seul
 * (`?code=` : mêmes fonctions que l'adaptateur papier). Le VERDICT (indépendants / incompatibles /
 * ni l'un ni l'autre) est tiré au tiers AVANT les nombres, puis les nombres sont construits pour
 * lui ; aucun nom de variante ne dit le verdict (pas de groupe à verdict). « Ni l'un ni l'autre » :
 * P(A ∩ B) à quelques unités du produit (jamais un écart qui saute aux yeux), ou une inclusion
 * (B ⊂ A, une région vide) une fois sur cinq.
 */

export const CATALOGUE_VARIANTES: { id: Variante160; label: string }[] = [
  { id: "venn", label: "Diagramme de Venn des effectifs" },
  { id: "tableau", label: "Tableau à double entrée" },
  { id: "valeurs", label: "Valeurs de P(A), P(B), P(A ∩ B) ou P(A ∪ B)" },
  { id: "contexte", label: "Dé, urne ou cartes : événements en mots" },
];

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)];
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

const NS = [20, 24, 25, 30, 36, 40, 48, 50, 60, 80, 100, 120, 200];

/** Effectifs (N, n(A), n(B), n(A ∩ B)) du verdict demandé. */
export function effectifsPour(verdict: Verdict160): { N: number; nA: number; nB: number; nAB: number } {
  for (;;) {
    const N = parmi(NS);
    const cands: [number, number, number][] = [];
    const lo = Math.ceil(0.2 * N);
    const hi = Math.floor(0.75 * N);
    if (verdict === "independants") {
      for (let nA = lo; nA <= hi; nA++)
        for (let nB = lo; nB <= hi; nB++) {
          if ((nA * nB) % N !== 0) continue;
          const nAB = (nA * nB) / N;
          if (nAB >= 1 && nA - nAB >= 1 && nB - nAB >= 1 && N - nA - nB + nAB >= 1) cands.push([nA, nB, nAB]);
        }
    } else if (verdict === "incompatibles") {
      for (let nA = Math.ceil(0.15 * N); nA <= Math.floor(0.6 * N); nA++)
        for (let nB = Math.ceil(0.15 * N); nB <= Math.floor(0.6 * N); nB++) if (nA + nB <= N - 1) cands.push([nA, nB, 0]);
    } else if (Math.random() < 0.2) {
      // Inclusion B ⊂ A : la région « B seulement » est vide (ni incompatibles, ni indépendants).
      for (let nA = lo; nA <= hi; nA++) for (let nB = lo; nB < nA; nB++) if (N - nA >= 1) cands.push([nA, nB, nB]);
    } else {
      for (let nA = lo; nA <= hi; nA++)
        for (let nB = lo; nB <= hi; nB++) {
          const e = (nA * nB) / N;
          for (let nAB = Math.max(1, Math.round(e) - 3); nAB <= Math.round(e) + 3; nAB++) {
            if (nAB * N === nA * nB) continue;
            if (nA - nAB >= 1 && nB - nAB >= 1 && N - nA - nB + nAB >= 1) cands.push([nA, nB, nAB]);
          }
        }
    }
    if (cands.length === 0) continue;
    const [nA, nB, nAB] = parmi(cands);
    return { N, nA, nB, nAB };
  }
}

function venn(verdict: Verdict160): ExVenn160 {
  return { variante: "venn", verdict, ctx: entier(0, CONTEXTES_160.length - 1), ...effectifsPour(verdict) };
}

function tableau(verdict: Verdict160): ExTableau160 {
  return { variante: "tableau", verdict, ctx: entier(0, CONTEXTES_160.length - 1), ...effectifsPour(verdict) };
}

const FRACTIONS: Q[] = [q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4), q(1, 5), q(2, 5), q(3, 5), q(4, 5), q(1, 6), q(5, 6), q(3, 8), q(5, 8), q(3, 10), q(7, 10)];

function valeurs(verdict: Verdict160): ExValeurs160 {
  const donnee = Math.random() < 0.5 ? "inter" : "union";
  const ecriture = Math.random() < 0.5 ? "decimal" : "fraction";
  for (;;) {
    let pA: Q;
    let pB: Q;
    if (ecriture === "decimal") {
      const a = q(entier(2, 8), 10);
      const b = q(entier(3, 17), 20);
      [pA, pB] = Math.random() < 0.5 ? [a, b] : [b, a];
    } else {
      pA = parmi(FRACTIONS);
      pB = parmi(FRACTIONS);
    }
    if (pA.n === pB.n && pA.d === pB.d) continue;
    const prod = qMul(pA, pB);
    let pAB: Q;
    if (verdict === "independants") pAB = prod;
    else if (verdict === "incompatibles") pAB = q(0);
    else {
      const delta = ecriture === "decimal" ? q(parmi([1, 2, 3, 5]) * parmi([-1, 1]), 100) : q(parmi([-1, 1]), prod.d * parmi([1, 2]));
      pAB = qAdd(prod, delta);
    }
    const union = qSub(qAdd(pA, pB), pAB);
    if (qVal(union) >= 1 - 1e-12) continue;
    if (qVal(pAB) < 0 || qVal(pAB) > Math.min(qVal(pA), qVal(pB)) - 1e-12) continue;
    if (verdict === "ni" && qVal(pAB) <= 0) continue;
    // Décimaux : au plus trois décimales partout (P(A ∪ B) compris).
    if (ecriture === "decimal" && [pAB, union].some((x) => Math.abs(qVal(x) * 1000 - Math.round(qVal(x) * 1000)) > 1e-7)) continue;
    return { variante: "valeurs", verdict, pA, pB, pAB, donnee, ecriture };
  }
}

const UNIVERS: { univers: Univers160; ns: number[] }[] = [
  { univers: "de", ns: [6, 8, 10, 12, 20] },
  { univers: "urne", ns: [10, 12, 15, 18, 20, 24, 30] },
  { univers: "cartes52", ns: [52] },
  { univers: "cartes32", ns: [32] },
];

function contexte(verdict: Verdict160): ExContexte160 {
  for (;;) {
    const u = parmi(UNIVERS);
    const n = parmi(u.ns);
    const om = issues(u.univers, n);
    const evs = evenementsUnivers(u.univers, n);
    const cands: ExContexte160[] = [];
    for (const A of evs)
      for (const B of evs) {
        if (A.id === B.id) continue;
        const nA = om.filter(A.test).length;
        const nB = om.filter(B.test).length;
        const nAB = om.filter((x) => A.test(x) && B.test(x)).length;
        if (nA === 0 || nB === 0 || nA === om.length || nB === om.length) continue;
        // Mêmes ensembles sous deux noms (ex. « pair » et « ≤ 1 » impossibles, mais « impair » = « non pair ») : écartés.
        if (nAB === nA && nAB === nB) continue;
        const ex: ExContexte160 = { variante: "contexte", verdict, univers: u.univers, n, evA: A.id, evB: B.id, N: om.length, nA, nB, nAB };
        if (verdictCalcule(ex) === verdict) cands.push(ex);
      }
    if (cands.length > 0) return parmi(cands);
  }
}

export function construireAvecVariante(id: string, verdictImpose?: Verdict160): Exercice160 {
  const variante = (CATALOGUE_VARIANTES.some((v) => v.id === id) ? id : "venn") as Variante160;
  // Verdict tiré AVANT les nombres, au tiers.
  const verdict = verdictImpose ?? parmi(VERDICTS_160);
  if (variante === "venn") return venn(verdict);
  if (variante === "tableau") return tableau(verdict);
  if (variante === "valeurs") return valeurs(verdict);
  return contexte(verdict);
}

export function genererExercice160(): Exercice160 {
  return construireAvecVariante(parmi(CATALOGUE_VARIANTES).id);
}
