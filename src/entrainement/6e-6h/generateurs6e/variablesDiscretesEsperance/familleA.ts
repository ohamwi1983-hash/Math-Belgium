import type { ExerciceEsperanceA, PredicatA } from "../../core6e/variablesDiscretesEsperance.types";
import { genererPoids, tirerBooleen, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * 6gen49, famille A (audit, G19) : loi donnée, deux événements, « contraires ? ».
 * - Verdict tiré AVANT les événements (50 / 50).
 * - Conditions variées, des deux côtés : la forme des événements ne dit plus le verdict (avant :
 *   « X ≤ k / X ≥ k+1 » toujours contraires, « X = k / X ≥ k » jamais).
 * - Aucun événement certain ou impossible, jamais deux fois le même ensemble, jamais « 3 ≤ X ≤ 3 ».
 * - Dans la moitié des « non contraires », P(E₁) + P(E₂) = 1 malgré tout (un chevauchement et un
 *   trou de même probabilité) : le test de la somme, dont le cours se méfie, ne suffit pas.
 */

const DENOMINATEUR = 20;

/** Indices (dans xs) des valeurs qui vérifient le prédicat. */
export function indicesPredicat(p: PredicatA, xs: number[]): number[] {
  const r: number[] = [];
  xs.forEach((x, i) => {
    let ok = false;
    switch (p.t) {
      case "le":
        ok = x <= p.k;
        break;
      case "lt":
        ok = x < p.k;
        break;
      case "ge":
        ok = x >= p.k;
        break;
      case "gt":
        ok = x > p.k;
        break;
      case "eq":
        ok = x === p.k;
        break;
      case "ne":
        ok = x !== p.k;
        break;
      case "pair":
        ok = x % 2 === 0;
        break;
      case "impair":
        ok = x % 2 !== 0;
        break;
      case "entre":
        ok = x >= p.a && x <= p.b;
        break;
      case "hors":
        ok = x < p.a || x > p.b;
        break;
    }
    if (ok) r.push(i);
  });
  return r;
}

/** Tous les prédicats « propres » sur ce support (paramètres pris parmi les valeurs de X). */
function tousLesPredicats(xs: number[]): PredicatA[] {
  const r: PredicatA[] = [{ t: "pair" }, { t: "impair" }];
  const min = xs[0];
  const max = xs[xs.length - 1];
  for (const k of xs) {
    if (k < max) r.push({ t: "le", k });
    if (k > min) r.push({ t: "lt", k });
    if (k > min) r.push({ t: "ge", k });
    if (k < max) r.push({ t: "gt", k });
    r.push({ t: "eq", k }, { t: "ne", k });
  }
  for (const a of xs)
    for (const b of xs) {
      if (b <= a) continue;
      if (!(a === min && b === max)) r.push({ t: "entre", a, b });
      if (a > min && b < max) r.push({ t: "hors", a, b });
    }
  return r;
}

function cle(indices: number[]): string {
  return indices.join(",");
}

function sommePoids(indices: number[], poids: number[]): number {
  return indices.reduce((s, i) => s + poids[i], 0);
}

export function construireFamilleA(): ExerciceEsperanceA {
  const contraires = tirerBooleen(0.5);
  const sommeUn = !contraires && tirerBooleen(0.5);
  for (let essai = 0; essai < 4000; essai++) {
    const m = tirerEntier(5, 8);
    const depart = tirerEntier(0, 3);
    const xs = Array.from({ length: m }, (_, i) => depart + i);
    const poids = genererPoids(m, DENOMINATEUR);
    const predicats = tousLesPredicats(xs).map((p) => ({ p, ind: indicesPredicat(p, xs) })).filter((o) => o.ind.length > 0 && o.ind.length < m);
    const p1 = tirerParmi(predicats);
    const complement = cle(xs.map((_, i) => i).filter((i) => !p1.ind.includes(i)));
    let candidats: typeof predicats;
    if (contraires) candidats = predicats.filter((o) => cle(o.ind) === complement);
    else
      candidats = predicats.filter((o) => {
        const k = cle(o.ind);
        if (k === complement || k === cle(p1.ind)) return false;
        if (!sommeUn) return true;
        const inter = o.ind.filter((i) => p1.ind.includes(i));
        const union = new Set([...o.ind, ...p1.ind]);
        return inter.length > 0 && union.size < m && sommePoids(o.ind, poids) + sommePoids(p1.ind, poids) === DENOMINATEUR;
      });
    if (candidats.length === 0) continue;
    const p2 = tirerParmi(candidats);
    const [e1, e2] = tirerBooleen(0.5) ? [p1, p2] : [p2, p1];
    return { famille: "A", xs, poids, e1: e1.p, e2: e2.p, indices1: e1.ind, indices2: e2.ind, contraires };
  }
  /* c8 ignore next */
  throw new Error("6gen49 A : aucun couple d'événements trouvé");
}
