import type { Q } from "../ui6e/outilsVariablesAleatoiresLotH1";
import { moins, q } from "../ui6e/outilsVariablesAleatoiresLotH1";

/**
 * Couche A — modèle de `6gen112` « Fonction de répartition » (6e ch. 8, § 1 et § 3).
 * - `escalier` : loi discrète (valeurs entières consécutives, probabilités en centièmes) ; F aux
 *   valeurs, probabilité d'un intervalle par F (borne stricte ou large : le piège du discret),
 *   « au moins k » / « plus de k » par le complément.
 * - `continue` : deux fonctions F₁, F₂ nulles avant 0 et égales à 1 après L ; UNE seule est une
 *   fonction de répartition d'une variable continue (verdict : laquelle, tiré à parts égales AVANT
 *   le reste ; l'autre n'atteint pas 1, décroît, ou devient négative). Puis P(X ≤ a) ou P(X > a),
 *   P(a < X < b) = F(b) − F(a) et la densité f = F′. Valeurs EXACTES (rationnels).
 */

export type Variante112 = "escalier" | "continue";
export type Phase112 = "repartition" | "intervalle" | "queue" | "choix" | "proba" | "intervalleC" | "densite";

export type TypeIntervalle = "]]" | "[]" | "][";
export type TypeQueue = ">=" | ">";

export type CandidatValide = "carre" | "lineaire" | "concave" | "cube";
export type CandidatInvalide = "pasUn" | "depasse" | "negative";

export interface Exercice112 {
  variante: Variante112;
  // --- escalier
  valeurs?: number[];
  /** Probabilités en centièmes. */
  probas?: number[];
  /** Indices (dans `valeurs`) des bornes a < b. */
  intervalle?: { i: number; j: number; type: TypeIntervalle };
  queue?: { k: number; type: TypeQueue };
  // --- continue
  L?: number;
  valide?: CandidatValide;
  invalide?: CandidatInvalide;
  /** Numéro (1 ou 2) de la fonction valide : le verdict. */
  numeroValide?: 1 | 2;
  proba?: { a: number; type: "<=" | ">" };
  bornes?: { a: number; b: number };
}

export function phases112(e: Exercice112): Phase112[] {
  return e.variante === "escalier" ? ["repartition", "intervalle", "queue"] : ["choix", "proba", "intervalleC", "densite"];
}

// ---------------------------------------------------------------------------
// Escalier
// ---------------------------------------------------------------------------

/** F aux valeurs, en centièmes (cumul). */
export function cumuls(e: Exercice112): number[] {
  let s = 0;
  return e.probas!.map((p) => (s += p));
}

/** F(valeurs[i]) en centièmes ; i < 0 → 0. */
export const Fi = (e: Exercice112, i: number) => (i < 0 ? 0 : cumuls(e)[i]!);

/** Probabilité de l'intervalle (centièmes) et indices des deux valeurs de F utilisées. */
export function probaIntervalle(e: Exercice112): { valeur: number; haut: number; bas: number } {
  const { i, j, type } = e.intervalle!;
  const haut = type === "][" ? j - 1 : j;
  const bas = type === "[]" ? i - 1 : i;
  return { valeur: Fi(e, haut) - Fi(e, bas), haut, bas };
}

export function probaQueue(e: Exercice112): { valeur: number; indice: number } {
  const { k, type } = e.queue!;
  const indice = type === ">=" ? k - 1 : k;
  return { valeur: 100 - Fi(e, indice), indice };
}

// ---------------------------------------------------------------------------
// Continue
// ---------------------------------------------------------------------------

/** F(x) exact pour un rationnel x de [0 ; L] (candidat valide ou non). */
export function Fq(nom: CandidatValide | CandidatInvalide, L: number, x: Q): Q {
  const x2 = q(x.n * x.n, x.d * x.d);
  const L2 = L * L;
  switch (nom) {
    case "carre":
      return q(x2.n, x2.d * L2);
    case "lineaire":
      return q(x.n, x.d * L);
    case "concave":
      return moins(q(2 * L * x.n, x.d * L2), q(x2.n, x2.d * L2));
    case "cube":
      return q(x.n ** 3, x.d ** 3 * L ** 3);
    case "pasUn":
      return q(x2.n, x2.d * L * (L + 1));
    case "depasse":
      return moins(q(3 * L * x.n, x.d * L2), q(2 * x2.n, x2.d * L2));
    case "negative":
      return moins(q(2 * x2.n, x2.d * L2), q(L * x.n, x.d * L2));
  }
}

/** Densité f = F′ du candidat valide (fonction numérique, comparaisons de saisie). */
export function densite(nom: CandidatValide, L: number): (x: number) => number {
  switch (nom) {
    case "carre":
      return (x) => (2 * x) / (L * L);
    case "lineaire":
      return () => 1 / L;
    case "concave":
      return (x) => (2 * (L - x)) / (L * L);
    case "cube":
      return (x) => (3 * x * x) / L ** 3;
  }
}

export const valeurF = (e: Exercice112, x: number) => Fq(e.valide!, e.L!, q(x));

export function probaContinue(e: Exercice112): Q {
  const F = valeurF(e, e.proba!.a);
  return e.proba!.type === "<=" ? F : moins(q(1), F);
}

export const probaIntervalleContinue = (e: Exercice112): Q => moins(valeurF(e, e.bornes!.b), valeurF(e, e.bornes!.a));

// ---------------------------------------------------------------------------
// Tirage
// ---------------------------------------------------------------------------

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function probas(n: number): number[] {
  for (;;) {
    const p = Array.from({ length: n - 1 }, () => 5 * entier(1, 8));
    const s = p.reduce((a, b) => a + b, 0);
    if (s <= 95) return [...p, 100 - s];
  }
}

export function tirer112(variante: Variante112): Exercice112 {
  if (variante === "escalier") {
    const n = entier(4, 5);
    const debut = entier(0, 1);
    const valeurs = Array.from({ length: n }, (_, i) => debut + i);
    const pr = probas(n);
    const type = parmi<TypeIntervalle>(["]]", "[]", "]["]);
    let i: number;
    let j: number;
    for (;;) {
      i = entier(0, n - 2);
      j = entier(i + 1, n - 1);
      if (type === "[]" && i === 0) continue;
      if (type === "][" && j - i < 2) continue;
      if (type === "]]" && j === n - 1 && i === 0) continue;
      break;
    }
    const queue = { k: entier(1, n - 2), type: parmi<TypeQueue>([">=", ">"]) };
    return { variante, valeurs, probas: pr, intervalle: { i, j, type }, queue };
  }
  const numeroValide = parmi<1 | 2>([1, 2]);
  const L = parmi([3, 4, 5, 6, 10]);
  const valide = parmi<CandidatValide>(["carre", "lineaire", "concave", "cube"]);
  const invalide = parmi<CandidatInvalide>(["pasUn", "depasse", "negative"]);
  const a = entier(1, L - 1);
  let b = entier(1, L - 1);
  let c = entier(1, L - 1);
  while (c === b) c = entier(1, L - 1);
  if (b > c) [b, c] = [c, b];
  return { variante, L, valide, invalide, numeroValide, proba: { a, type: parmi<"<=" | ">">(["<=", ">"]) }, bornes: { a: b, b: c } };
}
