import { appliquerRecurrence, estNul, natureListe, premiersTermes, rat, valeurExplicite, egal } from "../../core5e/definirSuite";
import type {
  ExerciceDefinirSuite,
  ExerciceNatureFormule,
  ExerciceNatureRecurrence,
  ExerciceNatureTermes,
  ExerciceNotations,
  ExerciceRecurrence,
  FamilleNotations,
  FormuleExplicite,
  IdVarianteDefinirSuite,
  PiegeTermes,
  Q,
  RecurrenceLineaire,
  RelationRecurrence,
  Verdict,
} from "../../core5e/definirSuite";

export type { IdVarianteDefinirSuite };

/**
 * Couche A (5e) — générateur de `5gen44` « Définir et reconnaître une suite » (chapitre 3 de 5e,
 * section `suites-geometriques`). N'utilise QUE `Math.random()` : le `?code=`
 * (`export/codeExercice.ts::avecGraine`) rejoue exactement le même tirage, dans l'appli comme dans
 * l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Verdict (variantes `nature-*`) : tiré AVANT la construction, 1/3 pour chaque issue
 * (arithmétique, géométrique, ni l'une ni l'autre), puis contrôlé sur les six premiers termes
 * (`natureListe`) — la boucle de rejet ne porte jamais sur le verdict, seulement sur les nombres.
 * Toutes les valeurs sont exactes (entiers ou fractions) : jamais de calculatrice.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

/** Entier non nul de valeur absolue dans [min ; max], signe au hasard. */
function signe(min: number, max: number): number {
  return (Math.random() < 0.5 ? -1 : 1) * entier(min, max);
}

const VERDICTS: Verdict[] = ["arithmetique", "geometrique", "aucune"];

/** Fraction « raisonnable » : numérateur et dénominateur bornés. */
function lisible(x: Q, maxNum = 999, maxDen = 999): boolean {
  return Math.abs(x.num) <= maxNum && x.den <= maxDen;
}

/** Aucun terme nul parmi les N premiers, u₂ ≠ u₁ (jamais de suite constante au départ). */
function termesSains(t: Q[]): boolean {
  return t.every((x) => !estNul(x)) && !egal(t[0], t[1]);
}

// ============================================================================
// Variante `notations`.
// ============================================================================

const FAMILLES_NOTATIONS: FamilleNotations[] = ["affine", "second-degre", "homographique", "exponentielle"];

function formuleNotations(famille: FamilleNotations): { f: FormuleExplicite; p: number } {
  switch (famille) {
    case "affine":
      return { f: { type: "affine", a: signe(2, 9), b: signe(1, 15), c: 1 }, p: entier(6, 30) };
    case "second-degre":
      return { f: { type: "second-degre", a: parmi([1, 1, 2, 3, -1, -2]), b: signe(1, 7), c: signe(1, 9) }, p: entier(3, 9) };
    case "homographique":
      for (;;) {
        const a = signe(1, 5);
        const b = signe(1, 7);
        const c = entier(1, 3);
        const d = entier(1, 6);
        if (a * d - b * c === 0) continue;
        return { f: { type: "homographique", a, b, c, d }, p: entier(2, 9) };
      }
    case "exponentielle":
      for (;;) {
        const p = parmi([rat(2), rat(3), rat(5), rat(-2), rat(-3), rat(1, 2)]);
        const k = rat(parmi([1, 2, 3, 4, 5, -1, -2, -3]));
        const f: FormuleExplicite = { type: "exponentielle", k, p, e: 1, dec: 0, ecriture: "produit" };
        const rang = entier(2, 6);
        // k = ±p : « 3·3ⁿ » s'écrirait 3ⁿ⁺¹, on l'écarte.
        if (Math.abs(k.num) === Math.abs(p.num) && p.den === 1) continue;
        if (lisible(valeurExplicite(f, rang), 3000, 64)) return { f, p: rang };
      }
  }
}

function construireNotations(): ExerciceNotations {
  const famille = parmi(FAMILLES_NOTATIONS);
  const autre = Math.random() < 0.5 ? "double" : "precedent";
  for (;;) {
    const { f, p } = formuleNotations(famille);
    // Valeur exacte lisible pour le terme demandé, et pour u₂ₚ… inutile : seul uₚ est calculé.
    if (lisible(valeurExplicite(f, p))) return { variante: "notations", famille, f, autre, p };
  }
}

// ============================================================================
// Variante `recurrence` (non affine, calcul de u₂, u₃, u₄).
// ============================================================================

function relationRecurrence(): RelationRecurrence {
  switch (parmi(["quotient", "inverse-plus", "inverse", "homographique", "carre"] as const)) {
    case "quotient":
      return { type: "homographique", style: "quotient", alpha: 1, beta: 0, gamma: entier(1, 3), delta: 1 };
    case "inverse-plus":
      return { type: "homographique", style: "inverse-plus", alpha: 1, beta: parmi([2, 3, 4, 6]), gamma: 1, delta: 0 };
    case "inverse": {
      const [a, b] = parmi([
        [1, 2],
        [2, 3],
        [1, 3],
        [3, 4],
        [4, 5],
        [2, 5],
      ]);
      return { type: "homographique", style: "inverse", alpha: 0, beta: a, gamma: -1, delta: b };
    }
    case "homographique":
      return { type: "homographique", style: "homographique", alpha: parmi([2, 3]), beta: parmi([1, -1, 2]), gamma: 1, delta: parmi([1, 2, 3]) };
    case "carre":
      return { type: "carre", style: "carre", c: parmi([-3, -2, -1, 1, 2]) };
  }
}

const DEPARTS: Q[] = [rat(0), rat(1), rat(2), rat(3), rat(-1), rat(-2), rat(1, 2), rat(1, 3)];

function construireRecurrence(): ExerciceRecurrence {
  for (;;) {
    const g = relationRecurrence();
    const u1 = parmi(DEPARTS);
    // uₙ² + c : départ entier (sinon des dénominateurs 4, 16, 256 sans intérêt).
    if (g.type === "carre" && u1.den !== 1) continue;
    try {
      const t = [u1];
      for (let i = 0; i < 3; i++) t.push(appliquerRecurrence(g, t[t.length - 1]));
      // Trois termes à calculer, tous lisibles, jamais deux termes consécutifs égaux.
      if (!t.every((x) => lisible(x, 700, 300))) continue;
      if (t.slice(1).some((x, i) => egal(x, t[i]))) continue;
      // u₁ = 0 seulement là où il ne rend pas le calcul trivial (u₂ = β/δ).
      if (estNul(u1) && g.type === "homographique" && g.beta === 0) continue;
      return { variante: "recurrence", g, u1 };
    } catch {
      // Dénominateur nul : on retire.
    }
  }
}

// ============================================================================
// Variante `nature-formule`.
// ============================================================================

function formuleNature(verdict: Verdict): FormuleExplicite {
  switch (verdict) {
    case "arithmetique":
      if (Math.random() < 0.6) return { type: "affine", a: signe(2, 9), b: signe(1, 12), c: 1 };
      for (;;) {
        const c = parmi([2, 3, 4, 5]);
        const a = signe(1, 7);
        const b = signe(1, 9);
        if (a % c === 0) continue;
        return { type: "affine", a, b, c };
      }
    case "geometrique":
      switch (parmi(["produit", "decale", "quotient", "inverse", "double"] as const)) {
        case "produit":
          return { type: "exponentielle", k: rat(parmi([2, 3, 4, 5, -2, -3])), p: parmi([rat(2), rat(3), rat(-2), rat(5), rat(1, 2)]), e: 1, dec: 0, ecriture: "produit" };
        case "decale":
          return { type: "exponentielle", k: rat(parmi([2, 3, 5, 6, -4])), p: parmi([rat(2), rat(3), rat(-3), rat(4)]), e: 1, dec: -1, ecriture: "produit" };
        case "quotient":
          return { type: "exponentielle", k: rat(1, parmi([2, 4, 5])), p: rat(parmi([3, 3, 2])), e: 1, dec: 1, ecriture: "quotient" };
        case "inverse":
          return { type: "exponentielle", k: rat(parmi([1, 3, 5, 6])), p: rat(parmi([2, 3])), e: -1, dec: 0, ecriture: "inverse" };
        case "double":
          return { type: "exponentielle", k: rat(parmi([1, 1, 3])), p: rat(parmi([2, 3])), e: 2, dec: 0, ecriture: "double" };
      }
      break;
    case "aucune":
      switch (parmi(["carre", "second-degre", "somme-expo", "inverse"] as const)) {
        case "carre":
          return { type: "second-degre", a: 1, b: 0, c: parmi([0, 1, 2, 3, 5, -5]) };
        case "second-degre":
          return { type: "second-degre", a: parmi([1, 2, -1]), b: signe(1, 5), c: 0 };
        case "somme-expo":
          return Math.random() < 0.5 ? { type: "somme-expo", p: parmi([2, 3]), alpha: parmi([1, 2, -1]), beta: 0 } : { type: "somme-expo", p: 2, alpha: 0, beta: parmi([1, 3, -3, 5]) };
        case "inverse":
          return Math.random() < 0.5 ? { type: "homographique", a: 0, b: parmi([1, 2, 3, 6]), c: 1, d: 0 } : { type: "homographique", a: 1, b: parmi([1, 2]), c: 1, d: 0 };
      }
  }
  throw new Error("formuleNature : cas impossible");
}

function construireNatureFormule(): ExerciceNatureFormule {
  const verdict = parmi(VERDICTS);
  for (;;) {
    const f = formuleNature(verdict);
    // Écritures qui se simplifieraient d'elles-mêmes : 3·3ⁿ, 3/3ⁿ, 2ⁿ⁺¹/4.
    if (f.type === "exponentielle" && f.p.den === 1) {
      if ((f.ecriture === "produit" || f.ecriture === "inverse") && f.k.den === 1 && Math.abs(f.k.num) === Math.abs(f.p.num)) continue;
      if (f.ecriture === "quotient" && f.k.den % f.p.num === 0) continue;
    }
    const e: ExerciceNatureFormule = { variante: "nature-formule", verdict, f };
    const t = premiersTermes(e, 6);
    if (!termesSains(t) || !t.slice(0, 2).every((x) => lisible(x, 999, 99))) continue;
    if (natureListe(t) !== verdict) continue;
    return e;
  }
}

// ============================================================================
// Variante `nature-recurrence` (uₙ₊₁ = A·uₙ + B·n + C).
// ============================================================================

function recurrenceLineaire(verdict: Verdict): RecurrenceLineaire {
  switch (verdict) {
    case "arithmetique": {
      const style = parmi(["somme", "somme-inversee", "deguisee-arith"] as const);
      if (style === "deguisee-arith") {
        const h = signe(1, 6);
        return { A: rat(1), B: 0, C: 2 * h, style, h };
      }
      return { A: rat(1), B: 0, C: signe(2, 12), style };
    }
    case "geometrique": {
      const style = parmi(["produit", "quotient", "fraction", "deguisee-geom"] as const);
      if (style === "produit") return { A: rat(parmi([2, 3, 4, 5, -2, -3])), B: 0, C: 0, style };
      if (style === "quotient") return { A: rat(Math.random() < 0.7 ? 1 : -1, parmi([2, 3, 4])), B: 0, C: 0, style };
      if (style === "fraction") return { A: parmi([rat(3, 2), rat(2, 3), rat(3, 4), rat(5, 2)]), B: 0, C: 0, style };
      const h = parmi([1, 2, 3]);
      return { A: rat(1 + h), B: 0, C: 0, style, h };
    }
    case "aucune":
      if (Math.random() < 0.5) return { A: parmi([rat(2), rat(3), rat(-1), rat(-2), rat(1, 2)]), B: 0, C: signe(1, 6), style: "affine" };
      return { A: rat(1), B: parmi([1, 2, 3, -1]), C: parmi([0, 0, 1, -1, 2]), style: "rang" };
  }
}

function construireNatureRecurrence(): ExerciceNatureRecurrence {
  const verdict = parmi(VERDICTS);
  for (;;) {
    const g = recurrenceLineaire(verdict);
    // u₁ multiple du dénominateur de A : u₂ entier.
    const u1 = rat(signe(1, 9) * g.A.den);
    const e: ExerciceNatureRecurrence = { variante: "nature-recurrence", verdict, g, u1 };
    const t = premiersTermes(e, 6);
    if (!termesSains(t.slice(0, 4)) || !t.every((x) => lisible(x, 5000, 999))) continue;
    if (natureListe(t) !== verdict) continue;
    return e;
  }
}

// ============================================================================
// Variante `nature-termes` (4 ou 5 premiers termes).
// ============================================================================

const RAISONS_GEOMETRIQUES: Q[] = [rat(2), rat(3), rat(4), rat(5), rat(-2), rat(-3), rat(1, 2), rat(1, 3), rat(-1, 2), rat(3, 2), rat(2, 3), rat(5, 2)];

function listeGeometrique(N: number, q: Q): Q[] {
  // u₁ = m · den^(N−1) (· num^0) : tous les termes entiers.
  const u1 = signe(1, 5) * Math.pow(q.den, N - 1);
  const t: Q[] = [rat(u1)];
  while (t.length < N) {
    const d = t[t.length - 1];
    t.push(rat(d.num * q.num, d.den * q.den));
  }
  return t;
}

function listeArithmetique(N: number, u1: number, r: number): Q[] {
  return Array.from({ length: N }, (_, i) => rat(u1 + i * r));
}

function listeTermes(verdict: Verdict, N: number): { termes: Q[]; piege: PiegeTermes | null } {
  switch (verdict) {
    case "arithmetique":
      return { termes: listeArithmetique(N, signe(1, 40), signe(2, 15)), piege: null };
    case "geometrique":
      return { termes: listeGeometrique(N, parmi(RAISONS_GEOMETRIQUES)), piege: null };
    case "aucune": {
      const piege = parmi(["ecart-dernier", "rapport-dernier", "second-degre"] as const);
      if (piege === "ecart-dernier") {
        const t = listeArithmetique(N, signe(1, 30), signe(2, 12));
        t[N - 1] = rat(t[N - 1].num + signe(1, 3));
        return { termes: t, piege };
      }
      if (piege === "rapport-dernier") {
        const t = listeGeometrique(N, parmi([rat(2), rat(3), rat(-2), rat(1, 2)]));
        t[N - 1] = rat(t[N - 1].num + signe(1, 4));
        return { termes: t, piege };
      }
      const [a, b, c] = parmi([
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
        [2, 0, -1],
        [1, 2, 0],
        [-1, 0, 20],
        [1, -1, 3],
      ]);
      // Triangulaires n(n + 1)/2 une fois sur quatre.
      if (Math.random() < 0.25) return { termes: Array.from({ length: N }, (_, i) => rat(((i + 1) * (i + 2)) / 2)), piege };
      return { termes: Array.from({ length: N }, (_, i) => rat(a * (i + 1) * (i + 1) + b * (i + 1) + c)), piege };
    }
  }
}

function construireNatureTermes(): ExerciceNatureTermes {
  const verdict = parmi(VERDICTS);
  const N = Math.random() < 0.5 ? 4 : 5;
  for (;;) {
    const { termes, piege } = listeTermes(verdict, N);
    if (!termesSains(termes) || !termes.every((x) => lisible(x, 3000, 1))) continue;
    if (natureListe(termes) !== verdict) continue;
    return { variante: "nature-termes", verdict, termes, piege };
  }
}

// ============================================================================
// Catalogue.
// ============================================================================

export const CATALOGUE_VARIANTES: { id: IdVarianteDefinirSuite; label: string }[] = [
  { id: "notations", label: "Notations : uₙ₊₁, u₂ₙ ou uₙ₋₁, et un terme précis (formule explicite)" },
  { id: "recurrence", label: "Récurrence non affine : calculer u₂, u₃, u₄ (valeurs exactes)" },
  { id: "nature-formule", label: "Nature d'une suite donnée par une formule explicite" },
  { id: "nature-recurrence", label: "Nature d'une suite donnée par une relation de récurrence" },
  { id: "nature-termes", label: "Premiers termes : compatibles avec une suite arithmétique, géométrique ou aucune ?" },
];

export function construireAvecVarianteId(id: IdVarianteDefinirSuite): ExerciceDefinirSuite {
  switch (id) {
    case "notations":
      return construireNotations();
    case "recurrence":
      return construireRecurrence();
    case "nature-formule":
      return construireNatureFormule();
    case "nature-recurrence":
      return construireNatureRecurrence();
    case "nature-termes":
      return construireNatureTermes();
  }
}

/** Tirage libre : les cinq variantes à parts égales. */
export function genererExerciceDefinirSuite(): ExerciceDefinirSuite {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
